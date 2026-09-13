// AgriTwin — Settings & Configuration Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_THRESHOLDS, INITIAL_FIELD_CONFIG } from '../data/demoConfiguration';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [thresholds, setThresholds] = useState(() => {
    try {
      const saved = localStorage.getItem('agritwin_thresholds');
      return saved ? JSON.parse(saved) : DEMO_THRESHOLDS;
    } catch (e) {
      return DEMO_THRESHOLDS;
    }
  });

  const [fieldConfig, setFieldConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('agritwin_field_config');
      return saved ? JSON.parse(saved) : INITIAL_FIELD_CONFIG;
    } catch (e) {
      return INITIAL_FIELD_CONFIG;
    }
  });

  const [firebaseConfig, setFirebaseConfig] = useState(() => {
    try {
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
    } catch (e) {
      return {
        apiKey: 'AIzaSyCwaRp-7Vwki8y0JKPqH9rXK1mvZQA4yUQ',
        authDomain: 'agritwin-5f1c4.firebaseapp.com',
        projectId: 'agritwin-5f1c4',
        storageBucket: 'agritwin-5f1c4.firebasestorage.app',
        messagingSenderId: '915718276777',
        appId: '1:915718276777:web:69d957f9122d4868684bb8',
        measurementId: 'G-Y7XQ7X4QQ2',
        isCustomConnected: true
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('agritwin_thresholds', JSON.stringify(thresholds));
    } catch (e) {
      // safe fallback
    }
  }, [thresholds]);

  useEffect(() => {
    try {
      localStorage.setItem('agritwin_field_config', JSON.stringify(fieldConfig));
    } catch (e) {
      // safe fallback
    }
  }, [fieldConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('agritwin_firebase_config', JSON.stringify(firebaseConfig));
    } catch (e) {
      // safe fallback
    }
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
  if (!context) {
    // Graceful fallback defaults instead of throwing unhandled error
    return {
      thresholds: DEMO_THRESHOLDS,
      fieldConfig: INITIAL_FIELD_CONFIG,
      firebaseConfig: { projectId: 'agritwin-5f1c4' },
      updateThresholds: () => {},
      updateFieldConfig: () => {},
      updateFirebaseConfig: () => {},
      resetSettingsToDefault: () => {}
    };
  }
  return context;
}
