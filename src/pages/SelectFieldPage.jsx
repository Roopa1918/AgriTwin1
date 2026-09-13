// AgriTwin — Farmer-Friendly Field Selection Screen (PRD Sections 6–15, 21–24)
// Features: OpenStreetMap Nominatim Place Search, Live GPS Location, Polygon Boundary Drawing,
// Automatic Acreage Calculation, "Is this your field?" Confirmation, and Crop Selection.

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useFields, CROP_OPTIONS } from '../context/FieldsContext';
import { useAuth } from '../context/AuthContext';
import { searchLocations, reverseGeocode, calculatePolygonAcres } from '../services/geocodingService';
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
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function SelectFieldPage({ onCancel, onFieldCreated }) {
  const { addField, fields } = useFields();
  const { user } = useAuth();

  // Wizard Steps: 
  // 'map' (draw boundary & search) -> 'confirm' (Is this your field?) -> 'details' (Name & Crop) -> 'success'
  const [currentStep, setCurrentStep] = useState('map');

  // Search & Geolocation State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [activeLayer, setActiveLayer] = useState('satellite'); // 'satellite' | 'street'

  // Map & Selected Field State
  const [fieldCenter, setFieldCenter] = useState({ lat: 12.5234, lng: 76.8971 }); // Default: Mandya/Mysuru region
  const [boundaryPoints, setBoundaryPoints] = useState([]);
  const [calculatedArea, setCalculatedArea] = useState(0);
  const [villageName, setVillageName] = useState('Mandya Rural, Karnataka');

  // Field Metadata Form
  const [fieldName, setFieldName] = useState('My Rice Field');
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [customCrop, setCustomCrop] = useState('');
  const [interactionMode, setInteractionMode] = useState('pan'); // 'pan' (Move & explore map) | 'draw' (Draw boundary)
  const interactionModeRef = useRef(interactionMode);

  useEffect(() => {
    interactionModeRef.current = interactionMode;
    if (mapContainerRef.current) {
      mapContainerRef.current.style.cursor = interactionMode === 'draw' ? 'crosshair' : 'grab';
    }
  }, [interactionMode]);

  // Refs for Leaflet
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const markerLayerRef = useRef(null);
  const userPinLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Debounced search when user types in search bar
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

  // Initialize Map with Free Panning in All Directions
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [fieldCenter.lat, fieldCenter.lng],
      zoom: 15,
      zoomControl: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      tap: false, // Critical: Disables buggy touch emulation so mouse and touch drag freely
      trackResize: true,
      inertia: true,
      inertiaDeceleration: 3000,
      inertiaMaxSpeed: Infinity,
      easeLinearity: 0.2
    });
    mapInstanceRef.current = map;

    // Explicitly enable all pan and zoom handlers
    map.dragging.enable();
    map.touchZoom.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();

    // Zoom control on top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add Tile Layer
    applyTileLayer(map, activeLayer);

    // Initial center pin
    updatePinMarker(map, fieldCenter.lat, fieldCenter.lng);

    // Ensure map container size is accurately computed
    const invalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    setTimeout(invalidate, 100);
    setTimeout(invalidate, 400);
    window.addEventListener('resize', invalidate);

    // When user drags map, sync center coordinates
    map.on('dragend', () => {
      const center = map.getCenter();
      setFieldCenter({ lat: center.lat, lng: center.lng });
    });

    // Handle Map Clicks: Draw points if in 'draw' mode, or center pin if in 'pan' mode
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setFieldCenter({ lat, lng });

      if (interactionModeRef.current === 'draw') {
        // Add to boundary points
        setBoundaryPoints((prev) => {
          const updated = [...prev, [lat, lng]];
          renderPolygon(map, updated);
          const acres = calculatePolygonAcres(updated);
          setCalculatedArea(acres);
          return updated;
        });
      } else {
        // In pan mode: update center pin without dropping polygon corners
        updatePinMarker(map, lat, lng);
      }

      // Reverse geocode to get village name
      reverseGeocode(lat, lng).then(name => setVillageName(name));
    });

    return () => {
      window.removeEventListener('resize', invalidate);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer between Satellite & Street
  const applyTileLayer = (map, type) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    if (type === 'satellite') {
      // Esri World Imagery (High-res satellite)
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      }).addTo(map);
    } else {
      // OpenStreetMap Street View
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);
    }
  };

  const toggleLayer = () => {
    const nextLayer = activeLayer === 'satellite' ? 'street' : 'satellite';
    setActiveLayer(nextLayer);
    if (mapInstanceRef.current) {
      applyTileLayer(mapInstanceRef.current, nextLayer);
    }
  };

  const updatePinMarker = (map, lat, lng, isLiveUser = false) => {
    if (userPinLayerRef.current) {
      map.removeLayer(userPinLayerRef.current);
    }

    const iconHtml = isLiveUser 
      ? `<div style="background: #3b82f6; border: 3px solid #fff; border-radius: 50%; width: 26px; height: 26px; box-shadow: 0 4px 15px rgba(59,130,246,0.6); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; font-weight: 800;">📍</div>`
      : `<div style="background: #10b981; border: 3px solid #fff; border-radius: 50%; width: 26px; height: 26px; box-shadow: 0 4px 15px rgba(16,185,129,0.6); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; font-weight: 800;">🌾</div>`;

    const pinIcon = L.divIcon({
      className: 'custom-field-pin',
      html: iconHtml,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    userPinLayerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
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

  // 1. Handle Location Selected from Search (PRD Section 8 & 9)
  const handleSelectSearchResult = (result) => {
    setSearchQuery(result.name);
    setSearchResults([]);
    setVillageName(result.name);
    setFieldCenter({ lat: result.lat, lng: result.lng });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([result.lat, result.lng], 16, { duration: 1.2 });
      updatePinMarker(mapInstanceRef.current, result.lat, result.lng);
    }
  };

  // 2. Handle Live Location (PRD Section 10 & 11)
  const handleUseLiveLocation = () => {
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
          mapInstanceRef.current.flyTo([latitude, longitude], 16, { duration: 1.2 });
          updatePinMarker(mapInstanceRef.current, latitude, longitude, true);
        }

        reverseGeocode(latitude, longitude).then(name => {
          setVillageName(name);
        });
      },
      (err) => {
        setLocationLoading(false);
        // Requirement 30: "We couldn't access your location. You can search for your field instead."
        setLocationError("We couldn't access your location. You can search for your field instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Reset / Clear boundary points
  const handleClearBoundary = () => {
    setBoundaryPoints([]);
    setCalculatedArea(0);
    if (mapInstanceRef.current && polygonLayerRef.current) {
      mapInstanceRef.current.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
  };

  // Proceed from Map to Confirmation ("Is this your field?")
  const handleProceedToConfirm = () => {
    if (boundaryPoints.length < 3) {
      // Auto-generate standard 2-acre boundary polygon around chosen center point if user just dropped a pin
      const lat = fieldCenter.lat;
      const lng = fieldCenter.lng;
      const generated = [
        [lat + 0.0012, lng - 0.0012],
        [lat + 0.0012, lng + 0.0012],
        [lat - 0.0012, lng + 0.0012],
        [lat - 0.0012, lng - 0.0012]
      ];
      setBoundaryPoints(generated);
      const acres = calculatePolygonAcres(generated);
      setCalculatedArea(acres || 2.2);
    }
    setCurrentStep('confirm');
  };

  // Finalize Field Creation
  const handleFinalizeField = () => {
    const finalCrop = selectedCrop === 'Other' && customCrop.trim() ? customCrop.trim() : selectedCrop;
    const finalArea = calculatedArea > 0 ? `${calculatedArea} Acres` : '2.0 Acres';

    const newField = addField({
      userId: user?.uid || 'user-default',
      name: fieldName.trim() || 'My Farm Field',
      crop: finalCrop,
      latitude: fieldCenter.lat,
      longitude: fieldCenter.lng,
      area: finalArea,
      boundary: boundaryPoints,
      village: villageName
    });

    setCurrentStep('success');
    if (onFieldCreated) {
      setTimeout(() => {
        onFieldCreated(newField);
      }, 1200);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#040d09',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Top Banner & Header */}
      <header style={{
        background: 'rgba(9, 23, 16, 0.95)',
        borderBottom: '1px solid var(--border-medium)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {fields.length > 0 && onCancel && (
            <button
              onClick={onCancel}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🌾</span> Select Your Field
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--emerald-400)', marginTop: '2px' }}>
              “Choose the agricultural field you want to monitor.”
            </p>
          </div>
        </div>

        {/* Layer Switcher */}
        {currentStep === 'map' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleLayer}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Toggle Satellite vs Street View"
            >
              <Layers size={15} color="var(--emerald-400)" />
              <span>{activeLayer === 'satellite' ? 'Satellite 🛰️' : 'Street Map 🗺️'}</span>
            </button>
          </div>
        )}
      </header>

      {/* STEP 1: INTERACTIVE MAP & 3-WAY SELECTION */}
      {currentStep === 'map' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Top Search & Live Location Bar — PRD Section 7, 8, 10 */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '96%',
            maxWidth: '720px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div 
              className="map-search-bar-row"
              style={{
                display: 'flex',
                gap: '8px',
                background: 'rgba(7, 20, 14, 0.95)',
                backdropFilter: 'blur(16px)',
                padding: '6px 8px',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-medium)',
                boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
                flexWrap: 'wrap'
              }}
            >
              {/* Search Bar Input */}
              <div style={{ flex: '1 1 200px', position: 'relative', display: 'flex', alignItems: 'center', minWidth: 0 }}>
                <Search size={18} color="var(--emerald-400)" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔎 Search field location..."
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '10px 34px 10px 38px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', minHeight: '32px', minWidth: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* 📍 Use My Live Location Button */}
              <button
                onClick={handleUseLiveLocation}
                disabled={locationLoading}
                className="btn btn-secondary"
                style={{
                  minHeight: '42px',
                  padding: '0 14px',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  borderColor: 'rgba(52, 211, 153, 0.4)',
                  flexShrink: 0
                }}
              >
                <Navigation size={15} color="var(--emerald-400)" />
                <span>{locationLoading ? 'Finding...' : '📍 Use Live GPS'}</span>
              </button>
            </div>

            {/* Search Loading Indicator */}
            {isSearching && (
              <div style={{
                background: 'rgba(9, 24, 17, 0.98)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px',
                textAlign: 'center',
                color: 'var(--emerald-400)',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <span className="search-spinner" style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(52, 211, 153, 0.2)',
                  borderTopColor: 'var(--emerald-400)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span>Searching locations across farms, campuses, landmarks & PIN codes...</span>
              </div>
            )}

            {/* Rich Search Results Dropdown List */}
            {!isSearching && searchResults.length > 0 && (
              <div style={{
                background: 'rgba(9, 24, 17, 0.98)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 20px 48px rgba(0,0,0,0.85)',
                maxHeight: '380px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '10px'
              }}>
                <div style={{
                  padding: '4px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--emerald-400)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>📍 Found {searchResults.length} places & landmarks</span>
                  <span style={{ color: 'var(--text-muted)' }}>Click 'Select Location' to center map</span>
                </div>

                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="search-result-card"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 200px', minWidth: 0 }}>
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        borderRadius: '50%',
                        padding: '8px',
                        marginTop: '2px',
                        flexShrink: 0
                      }}>
                        <MapPin size={18} color="var(--emerald-400)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#fff' }}>
                            {item.name}
                          </span>
                          {item.type && (
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: 'rgba(59, 130, 246, 0.18)',
                              color: '#60a5fa',
                              padding: '2px 7px',
                              borderRadius: '12px',
                              border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>
                              {item.type}
                            </span>
                          )}
                          {item.distance && (
                            <span style={{
                              fontSize: '0.72rem',
                              color: 'var(--amber-400)',
                              fontWeight: 600,
                              background: 'rgba(245, 158, 11, 0.12)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              📍 {item.distance}
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          marginTop: '4px',
                          lineHeight: 1.4,
                          whiteSpace: 'normal',
                          wordBreak: 'break-word'
                        }}>
                          {item.displayName}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectSearchResult(item)}
                      className="btn btn-primary btn-sm"
                      style={{
                        minHeight: '40px',
                        padding: '8px 14px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        flexShrink: 0
                      }}
                    >
                      <span>Select Location</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Location Error Notice */}
            {locationError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.9)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{locationError}</span>
              </div>
            )}
          </div>

          {/* Fullscreen Map Canvas */}
          <div 
            ref={mapContainerRef} 
            style={{ 
              flex: 1, 
              width: '100%', 
              height: 'calc(100vh - 140px)', 
              minHeight: '380px' 
            }} 
          />

          {/* Bottom Action / Boundary Drawer Bar — PRD Section 12 & 24 */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '94%',
            maxWidth: '680px',
            zIndex: 1000,
            background: 'rgba(8, 22, 15, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xl)',
            padding: '14px 16px',
            boxShadow: '0 16px 50px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {/* Mode Switcher: Pan & Move vs Draw Boundary */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setInteractionMode('pan')}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: interactionMode === 'pan' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: interactionMode === 'pan' ? '2px solid var(--emerald-400)' : '1px solid var(--border-subtle)',
                  color: interactionMode === 'pan' ? '#34d399' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span>✋ Move Map</span>
              </button>

              <button
                type="button"
                onClick={() => setInteractionMode('draw')}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: interactionMode === 'draw' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: interactionMode === 'draw' ? '2px solid var(--emerald-400)' : '1px solid var(--border-subtle)',
                  color: interactionMode === 'draw' ? '#34d399' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span>✏️ Draw Boundary</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([fieldCenter.lat, fieldCenter.lng], 16, { duration: 0.8 });
                  }
                }}
                className="btn btn-secondary btn-sm"
                title="Re-center on selected field pin"
                style={{ minHeight: '44px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
              >
                <span>🎯 Center</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--emerald-400)', fontWeight: 700, letterSpacing: '0.04em' }}>
                  {interactionMode === 'pan' ? 'Navigation Mode' : 'Boundary Drawing Mode'}
                </span>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', marginTop: '2px' }}>
                  {interactionMode === 'pan' ? (
                    <span>✋ Click & drag anywhere to move freely. Zoom in/out to find your field.</span>
                  ) : boundaryPoints.length >= 3 ? (
                    <span style={{ color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} /> Boundary polygon completed ✓
                    </span>
                  ) : (
                    <span>✏️ Click corners on the map around your land to draw boundary</span>
                  )}
                </div>
              </div>

              {boundaryPoints.length >= 3 && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid var(--emerald-400)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 12px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  color: 'var(--emerald-300)',
                  whiteSpace: 'nowrap'
                }}>
                  Area: {calculatedArea} acres
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {boundaryPoints.length > 0 && (
                <button
                  onClick={handleClearBoundary}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RotateCcw size={14} />
                  <span>Redraw Boundary</span>
                </button>
              )}

              <button
                onClick={handleProceedToConfirm}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>✓ Use This Field</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: FIELD CONFIRMATION ("Is this your field?" — PRD Section 13) */}
      {currentStep === 'confirm' && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'radial-gradient(circle at 50% 30%, #0d281e 0%, #040c09 80%)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: '#091c14',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 28px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                padding: '14px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid var(--emerald-400)',
                marginBottom: '12px'
              }}>
                <MapPin size={36} color="var(--emerald-400)" />
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                Is this your field?
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Verify the location and boundary before creating your Digital Twin.
              </p>
            </div>

            {/* Field Summary Card */}
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Location</span>
                <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#fff' }}>{villageName}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Approximate Area</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
                  {calculatedArea > 0 ? `${calculatedArea} acres` : '2.0 acres'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Latitude & Longitude</span>
                <span style={{ fontSize: '0.84rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                  {fieldCenter.lat.toFixed(4)}°N, {fieldCenter.lng.toFixed(4)}°E
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Boundary Points</span>
                <span style={{ fontSize: '0.85rem', color: '#fff' }}>
                  {boundaryPoints.length >= 3 ? `${boundaryPoints.length} polygon points` : 'Center Plot Boundary'}
                </span>
              </div>
            </div>

            {/* Confirmation Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setCurrentStep('map')}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '13px', fontSize: '0.95rem' }}
              >
                <span>↩ Select Again</span>
              </button>

              <button
                onClick={() => setCurrentStep('details')}
                className="btn btn-primary"
                style={{
                  flex: 1.5,
                  padding: '13px',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(16,185,129,0.3)'
                }}
              >
                <span>✓ Yes, Use This Field</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: FIELD INFORMATION & CROP SELECTION (PRD Section 14 & 15) */}
      {currentStep === 'details' && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'radial-gradient(circle at 50% 30%, #0d281e 0%, #040c09 80%)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '560px',
            background: '#091c14',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 28px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px'
          }}>
            <div>
              <button
                onClick={() => setCurrentStep('confirm')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}
              >
                <ArrowLeft size={16} />
                <span style={{ fontSize: '0.84rem' }}>Back</span>
              </button>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                Field Details 🌱
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Give your field a recognizable name and select the crop you are cultivating.
              </p>
            </div>

            {/* Field Name Input — PRD Section 14 */}
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', color: '#fff', fontWeight: 700, marginBottom: '6px' }}>
                What should we call this field?
              </label>
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="e.g. My Rice Field, South Plot"
                style={{
                  width: '100%',
                  background: 'rgba(5, 14, 10, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '0.98rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Crop Selector — PRD Section 14 */}
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', color: '#fff', fontWeight: 700, marginBottom: '8px' }}>
                What crop are you growing?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '8px' }}>
                {CROP_OPTIONS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCrop(c.id)}
                    style={{
                      background: selectedCrop === c.id ? 'rgba(16, 185, 129, 0.25)' : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${selectedCrop === c.id ? 'var(--emerald-400)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 10px',
                      color: selectedCrop === c.id ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>

              {selectedCrop === 'Other' && (
                <input
                  type="text"
                  value={customCrop}
                  onChange={(e) => setCustomCrop(e.target.value)}
                  placeholder="Enter your crop name..."
                  style={{
                    width: '100%',
                    background: 'rgba(5, 14, 10, 0.85)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    color: '#fff',
                    marginTop: '10px',
                    fontSize: '0.92rem'
                  }}
                />
              )}
            </div>

            {/* Create My Field Button — PRD Section 14 */}
            <button
              onClick={handleFinalizeField}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1.05rem',
                fontWeight: 800,
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 6px 25px rgba(16, 185, 129, 0.35)'
              }}
            >
              <Sparkles size={18} />
              <span>🌱 Create My Field</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION */}
      {currentStep === 'success' && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'radial-gradient(circle at 50% 30%, #0d281e 0%, #040c09 80%)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            background: '#091c14',
            border: '1px solid var(--emerald-400)',
            borderRadius: 'var(--radius-xl)',
            padding: '36px 30px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(16,185,129,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid var(--emerald-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={40} color="var(--emerald-400)" />
            </div>

            <h2 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 800 }}>
              {fieldName} is Ready! 🌱
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>
              Your digital field boundary at <strong>{villageName}</strong> has been saved. 
              Live weather is now streaming for your coordinates and your 3D Digital Twin is generated!
            </p>

            <button
              onClick={() => onFieldCreated && onFieldCreated()}
              className="btn btn-primary"
              style={{ padding: '13px 32px', fontSize: '1rem', fontWeight: 700, marginTop: '8px' }}
            >
              Open Digital Twin Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
