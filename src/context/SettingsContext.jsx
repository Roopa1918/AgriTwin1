// AgriTwin — Settings & Configuration Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_THRESHOLDS, INITIAL_FIELD_CONFIG } from '../data/demoConfiguration';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem('agritwin_thresholds');
    return saved ? JSON.parse(saved) : DEMO_THRESHOLDS;
  });

  const [fieldConfig, setFieldConfig] = useState(() => {
    const saved = localStorage.getItem('agritwin_field_config');
    return saved ? JSON.parse(saved) : INITIAL_FIELD_CONFIG;
  });

  const [firebaseConfig, setFirebaseConfig] = useState(() => {
    const saved = localStorage.getItem('agritwin_firebase_config');
    return saved ? JSON.parse(saved) : {
      apiKey: 'AIzaSyCwaRp-7Vwki8y0JKPqH9rXK1mvZQA4yUQ',
      authDomain: 'agritwin-5f1c4.firebaseapp.com',
      projectId: 'agritwin-5f1c4',
      storageBucket: 'agritwin-5f1c4.firebasestorage.app',
      messagingSenderId: '915718276777',
      appId: '1:915718276777:web:69d957f9122d4868684bb8',
      measurementId: 'G-Y7XQ7X4QQ2',
      isCustomConnected: true
    };
  });

  useEffect(() => {
    localStorage.setItem('agritwin_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  useEffect(() => {
    localStorage.setItem('agritwin_field_config', JSON.stringify(fieldConfig));
  }, [fieldConfig]);

  useEffect(() => {
    localStorage.setItem('agritwin_firebase_config', JSON.stringify(firebaseConfig));
  }, [firebaseConfig]);

  const updateThresholds = (newThresholds) => {
    setThresholds(prev => ({ ...prev, ...newThresholds }));
  };

  const updateFieldConfig = (newConfig) => {
    setFieldConfig(prev => ({ ...prev, ...newConfig }));
  };

  const updateFirebaseConfig = (newConfig) => {
    setFirebaseConfig(prev => ({ ...prev, ...newConfig }));
  };

  const resetSettingsToDefault = () => {
    setThresholds(DEMO_THRESHOLDS);
    setFieldConfig(INITIAL_FIELD_CONFIG);
  };

  return (
    <SettingsContext.Provider value={{
      thresholds,
      fieldConfig,
      firebaseConfig,
      updateThresholds,
      updateFieldConfig,
      updateFirebaseConfig,
      resetSettingsToDefault
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}
