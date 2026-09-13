// AgriTwin — Multi-Field Management & Dynamic Zone Context (PRD Section 6, 14–17, 28)
// Stores user-created fields, boundaries, crops, acreage, and generates dynamic 4-zone telemetry.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseBridge } from '../services/firebase';

const FieldsContext = createContext(null);

// PRD Section 14: Required crop options
export const CROP_OPTIONS = [
  { id: 'Rice', label: 'Rice (Paddy) 🌾', icon: '🌾', waterNeed: 'High', daysToMaturity: 120 },
  { id: 'Maize', label: 'Maize (Corn) 🌽', icon: '🌽', waterNeed: 'Medium', daysToMaturity: 105 },
  { id: 'Wheat', label: 'Wheat 🌾', icon: '🌾', waterNeed: 'Medium', daysToMaturity: 110 },
  { id: 'Tomato', label: 'Tomato 🍅', icon: '🍅', waterNeed: 'Medium-High', daysToMaturity: 90 },
  { id: 'Potato', label: 'Potato 🥔', icon: '🥔', waterNeed: 'Medium', daysToMaturity: 95 },
  { id: 'Groundnut', label: 'Groundnut 🥜', icon: '🥜', waterNeed: 'Low-Medium', daysToMaturity: 100 },
  { id: 'Cotton', label: 'Cotton ☁️', icon: '☁️', waterNeed: 'Medium', daysToMaturity: 150 },
  { id: 'Sugarcane', label: 'Sugarcane 🎋', icon: '🎋', waterNeed: 'High', daysToMaturity: 360 },
  { id: 'Pulses', label: 'Pulses (Lentils) 🫘', icon: '🫘', waterNeed: 'Low', daysToMaturity: 75 },
  { id: 'Vegetables', label: 'Vegetables 🥬', icon: '🥬', waterNeed: 'Medium', daysToMaturity: 60 },
  { id: 'Other', label: 'Other Crop 🌱', icon: '🌱', waterNeed: 'Medium', daysToMaturity: 90 }
];

export function FieldsProvider({ children }) {
  // Load saved fields from localStorage
  const [fields, setFields] = useState(() => {
    try {
      const saved = localStorage.getItem('agritwin_user_fields');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading saved fields:', e);
    }
    return []; // New users start with 0 fields to prompt field selection
  });

  const [activeFieldId, setActiveFieldId] = useState(() => {
    return localStorage.getItem('agritwin_active_field_id') || null;
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('agritwin_user_fields', JSON.stringify(fields));
  }, [fields]);

  useEffect(() => {
    if (activeFieldId) {
      localStorage.setItem('agritwin_active_field_id', activeFieldId);
    }
  }, [activeFieldId]);

  // Keep activeField in sync
  const activeField = fields.find(f => f.id === activeFieldId) || fields[0] || null;

  // Add new field from map drawing/selection wizard (PRD Section 14 & 15)
  const addField = ({ userId, name, crop, latitude, longitude, area, boundary, village }) => {
    const cropMeta = CROP_OPTIONS.find(c => c.id.toLowerCase() === crop.toLowerCase()) || { icon: '🌱' };
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    // Compute simple boundary polygon if not drawn
    const poly = boundary && boundary.length >= 3 ? boundary : [
      [lat + 0.0012, lon - 0.0012],
      [lat + 0.0012, lon + 0.0012],
      [lat - 0.0012, lon + 0.0012],
      [lat - 0.0012, lon - 0.0012]
    ];

    const newField = {
      id: 'field_' + Date.now(),
      userId: userId || 'user-default',
      name: name.trim() || 'My Farm Field',
      crop: crop || 'Rice',
      cropIcon: cropMeta.icon,
      village: village || 'Selected Field Location',
      latitude: lat,
      longitude: lon,
      area: area || '2.0 Acres',
      boundary: poly,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      zones: [
        { id: 'zone1', name: 'Zone A (North-West)', shortName: 'Zone A', soilWater: 42.0, status: 'Good', sensorId: 'SM-Z01' },
        { id: 'zone2', name: 'Zone B (North-East - Target)', shortName: 'Zone B', soilWater: 24.5, status: 'Needs Water', sensorId: 'SM-Z02' },
        { id: 'zone3', name: 'Zone C (South-West)', shortName: 'Zone C', soilWater: 39.0, status: 'Good', sensorId: 'SM-Z03' },
        { id: 'zone4', name: 'Zone D (South-East)', shortName: 'Zone D', soilWater: 44.5, status: 'Good', sensorId: 'SM-Z04' }
      ]
    };

    setFields(prev => [newField, ...prev]);
    setActiveFieldId(newField.id);

    // Save to Firebase Firestore
    firebaseBridge.setDocument('fields', newField.id, newField);
    return newField;
  };

  // Helper to load sample field for Presentation / Demo mode
  const loadDemoField = () => {
    if (fields.length > 0) return fields[0];

    const demoField = {
      id: 'field_demo_mandya_01',
      userId: 'demo-presenter',
      name: 'My Rice Field',
      crop: 'Rice',
      cropIcon: '🌾',
      village: 'Mandya, Karnataka',
      latitude: 12.5234,
      longitude: 76.8971,
      area: '2.4 Acres',
      createdAt: new Date().toISOString().split('T')[0],
      boundary: [
        [12.5245, 76.8955],
        [12.5248, 76.8988],
        [12.5218, 76.8985],
        [12.5215, 76.8958]
      ],
      zones: [
        { id: 'zone1', name: 'Zone A (North-West)', shortName: 'Zone A', soilWater: 41.5, status: 'Good', sensorId: 'SM-Z01' },
        { id: 'zone2', name: 'Zone B (North-East - Target)', shortName: 'Zone B', soilWater: 23.8, status: 'Needs Water', sensorId: 'SM-Z02' },
        { id: 'zone3', name: 'Zone C (South-West)', shortName: 'Zone C', soilWater: 38.0, status: 'Good', sensorId: 'SM-Z03' },
        { id: 'zone4', name: 'Zone D (South-East)', shortName: 'Zone D', soilWater: 45.0, status: 'Good', sensorId: 'SM-Z04' }
      ]
    };

    setFields([demoField]);
    setActiveFieldId(demoField.id);
    return demoField;
  };

  const deleteField = (id) => {
    setFields(prev => {
      const filtered = prev.filter(f => f.id !== id);
      if (filtered.length > 0 && activeFieldId === id) {
        setActiveFieldId(filtered[0].id);
      } else if (filtered.length === 0) {
        setActiveFieldId(null);
      }
      return filtered;
    });
  };

  const updateActiveFieldZone = (zoneId, updates) => {
    setFields(prev => prev.map(field => {
      if (field.id === activeFieldId) {
        const updatedZones = field.zones.map(z => z.id === zoneId ? { ...z, ...updates } : z);
        return { ...field, zones: updatedZones };
      }
      return field;
    }));
  };

  return (
    <FieldsContext.Provider value={{
      fields,
      activeField,
      activeFieldId,
      setActiveFieldId,
      addField,
      deleteField,
      loadDemoField,
      updateActiveFieldZone,
      cropOptions: CROP_OPTIONS
    }}>
      {children}
    </FieldsContext.Provider>
  );
}

export function useFields() {
  const context = useContext(FieldsContext);
  if (!context) throw new Error('useFields must be used within a FieldsProvider');
  return context;
}
