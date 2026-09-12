// AgriTwin — Multi-Field Management & Dynamic Zone Context (PRD Section 5 & 25)
// Stores user-selected fields, boundaries, crops, and generates 4 dynamic zones.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseBridge } from '../services/firebase';

const FieldsContext = createContext(null);

export const CROP_OPTIONS = [
  { id: 'Tomato', label: 'Tomato 🍅', icon: '🍅', waterNeed: 'Medium-High', daysToMaturity: 90 },
  { id: 'Rice', label: 'Rice (Paddy) 🌾', icon: '🌾', waterNeed: 'High', daysToMaturity: 120 },
  { id: 'Maize', label: 'Maize (Corn) 🌽', icon: '🌽', waterNeed: 'Medium', daysToMaturity: 105 },
  { id: 'Wheat', label: 'Wheat 🌾', icon: '🌾', waterNeed: 'Medium', daysToMaturity: 110 },
  { id: 'Potato', label: 'Potato 🥔', icon: '🥔', waterNeed: 'Medium', daysToMaturity: 95 },
  { id: 'Groundnut', label: 'Groundnut (Peanut) 🥜', icon: '🥜', waterNeed: 'Low-Medium', daysToMaturity: 100 },
  { id: 'Sugarcane', label: 'Sugarcane 🎋', icon: '🎋', waterNeed: 'High', daysToMaturity: 360 },
  { id: 'Cotton', label: 'Cotton ☁️', icon: '☁️', waterNeed: 'Medium', daysToMaturity: 150 },
  { id: 'Pulses', label: 'Pulses (Lentils) 🫘', icon: '🫘', waterNeed: 'Low', daysToMaturity: 75 },
  { id: 'Other', label: 'Other Crop 🌱', icon: '🌱', waterNeed: 'Medium', daysToMaturity: 90 }
];

export const INITIAL_USER_FIELDS = [
  {
    id: 'field_tomato_01',
    name: 'My Tomato Field',
    crop: 'Tomato',
    cropIcon: '🍅',
    village: 'Rural Farm Plot',
    latitude: 11.0168,
    longitude: 76.9558,
    area: '2.5 Acres (1.0 Ha)',
    createdAt: '2026-09-10',
    boundary: [
      [11.0180, 76.9545],
      [11.0182, 76.9570],
      [11.0155, 76.9572],
      [11.0153, 76.9546]
    ],
    zones: [
      { id: 'zone1', name: 'Zone 1 (North-West)', shortName: 'Zone 1', soilWater: 41.2, status: 'Good', sensorId: 'SM-Z01' },
      { id: 'zone2', name: 'Zone 2 (North-East - Target)', shortName: 'Zone 2', soilWater: 24.2, status: 'Needs Water', sensorId: 'SM-Z02' },
      { id: 'zone3', name: 'Zone 3 (South-West)', shortName: 'Zone 3', soilWater: 38.0, status: 'Watch', sensorId: 'SM-Z03' },
      { id: 'zone4', name: 'Zone 4 (South-East)', shortName: 'Zone 4', soilWater: 43.5, status: 'Good', sensorId: 'SM-Z04' }
    ]
  },
  {
    id: 'field_rice_02',
    name: 'Green Rice Field',
    crop: 'Rice',
    cropIcon: '🌾',
    village: 'Lowland Delta Farm',
    latitude: 10.7870,
    longitude: 79.1378,
    area: '4.0 Acres (1.6 Ha)',
    createdAt: '2026-09-08',
    boundary: [
      [10.7885, 79.1360],
      [10.7885, 79.1395],
      [10.7855, 79.1395],
      [10.7855, 79.1360]
    ],
    zones: [
      { id: 'zone1', name: 'Zone 1 (Inlet)', shortName: 'Zone 1', soilWater: 48.0, status: 'Good', sensorId: 'SM-Z01' },
      { id: 'zone2', name: 'Zone 2 (Central Canal)', shortName: 'Zone 2', soilWater: 45.5, status: 'Good', sensorId: 'SM-Z02' },
      { id: 'zone3', name: 'Zone 3 (South Terrace)', shortName: 'Zone 3', soilWater: 42.0, status: 'Good', sensorId: 'SM-Z03' },
      { id: 'zone4', name: 'Zone 4 (Tail End)', shortName: 'Zone 4', soilWater: 36.8, status: 'Watch', sensorId: 'SM-Z04' }
    ]
  }
];

export function FieldsProvider({ children }) {
  const [fields, setFields] = useState(() => {
    const saved = localStorage.getItem('agritwin_user_fields');
    return saved ? JSON.parse(saved) : INITIAL_USER_FIELDS;
  });

  const [activeFieldId, setActiveFieldId] = useState(() => {
    const saved = localStorage.getItem('agritwin_active_field_id');
    return saved && INITIAL_USER_FIELDS.some(f => f.id === saved) ? saved : INITIAL_USER_FIELDS[0].id;
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('agritwin_user_fields', JSON.stringify(fields));
  }, [fields]);

  useEffect(() => {
    localStorage.setItem('agritwin_active_field_id', activeFieldId);
  }, [activeFieldId]);

  // Find active field
  const activeField = fields.find(f => f.id === activeFieldId) || fields[0];

  // Add new field from map drawing/selection wizard
  const addField = ({ name, crop, latitude, longitude, area, boundary, village }) => {
    const cropMeta = CROP_OPTIONS.find(c => c.id.toLowerCase() === crop.toLowerCase()) || { icon: '🌱' };
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    // Compute simple boundary polygon if not drawn
    const poly = boundary && boundary.length >= 3 ? boundary : [
      [lat + 0.0015, lon - 0.0015],
      [lat + 0.0015, lon + 0.0015],
      [lat - 0.0015, lon + 0.0015],
      [lat - 0.0015, lon - 0.0015]
    ];

    const newField = {
      id: 'field_' + Date.now(),
      name: name.trim() || 'My Farm Field',
      crop: crop || 'Tomato',
      cropIcon: cropMeta.icon,
      village: village || 'Selected Map Location',
      latitude: lat,
      longitude: lon,
      area: area || '2.5 Acres (1.0 Ha)',
      createdAt: new Date().toISOString().split('T')[0],
      boundary: poly,
      zones: [
        { id: 'zone1', name: 'Zone 1 (North-West)', shortName: 'Zone 1', soilWater: 42.0, status: 'Good', sensorId: 'SM-Z01' },
        { id: 'zone2', name: 'Zone 2 (North-East)', shortName: 'Zone 2', soilWater: 38.5, status: 'Watch', sensorId: 'SM-Z02' },
        { id: 'zone3', name: 'Zone 3 (South-West)', shortName: 'Zone 3', soilWater: 40.2, status: 'Good', sensorId: 'SM-Z03' },
        { id: 'zone4', name: 'Zone 4 (South-East)', shortName: 'Zone 4', soilWater: 44.0, status: 'Good', sensorId: 'SM-Z04' }
      ]
    };

    setFields(prev => [newField, ...prev]);
    setActiveFieldId(newField.id);

    // Sync to Firestore
    firebaseBridge.setDocument('fields', newField.id, newField);
    return newField;
  };

  const deleteField = (id) => {
    setFields(prev => {
      const filtered = prev.filter(f => f.id !== id);
      if (filtered.length > 0 && activeFieldId === id) {
        setActiveFieldId(filtered[0].id);
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
