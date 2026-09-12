// AgriTwin — Unified Farmer-Friendly Telemetry & Digital Twin Context
// Combines 🟢 LIVE WEATHER (Open-Meteo) with 🟡 SIMULATED SENSOR DATA for the active field.

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useFields } from './FieldsContext';
import { fetchLiveWeather } from '../services/weatherService';
import { firebaseBridge } from '../services/firebase';

const TelemetryContext = createContext(null);

export function TelemetryProvider({ children }) {
  const { activeField, updateActiveFieldZone } = useFields();

  // 1. Live Weather State (Open-Meteo Real Data)
  const [liveWeather, setLiveWeather] = useState({
    temperature: 29,
    humidity: 68,
    rainfall: 0.0,
    windSpeed: 12,
    condition: 'Partly Cloudy',
    conditionIcon: '⛅',
    hourly: [],
    daily: [],
    lastUpdated: 'Just now',
    isLive: true
  });
  const [weatherLoading, setWeatherLoading] = useState(false);

  // 2. Simulated Soil Sensors State for Active Field's 4 Zones
  const [zones, setZones] = useState(() => activeField?.zones || []);
  const [isDecliningZone2, setIsDecliningZone2] = useState(false);
  const [isIrrigatingZone2, setIsIrrigatingZone2] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState('normal'); // 'slow' (6s), 'normal' (3s), 'fast' (1s)
  const [isEngineRunning, setIsEngineRunning] = useState(true);
  const [activeScenario, setActiveScenario] = useState('normal'); // 'normal', 'hot', 'hotDry', 'rain'

  // History buffer for graphs (Today / 7 Days / 30 Days)
  const [historyBuffer, setHistoryBuffer] = useState({
    times: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
    zone1: [42, 42, 41.5, 41.2, 41, 41.2, 41.2],
    zone2: [38, 35, 32, 29, 26, 25, 24.2],
    zone3: [40, 39.5, 39, 38.5, 38, 38, 38],
    zone4: [45, 44.5, 44, 43.8, 43.5, 43.5, 43.5],
    temperatures: [24, 26, 28, 30, 31, 29, 27],
    rainfall: [0, 0, 0, 0, 0, 2.0, 0]
  });

  // Presentation Stepper
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Sync zones whenever activeField changes
  useEffect(() => {
    if (activeField?.zones) {
      setZones(activeField.zones);
    }
  }, [activeField?.id]);

  // Fetch real live weather whenever activeField coordinates change
  useEffect(() => {
    let isMounted = true;
    async function loadWeather() {
      if (!activeField) return;
      setWeatherLoading(true);
      const w = await fetchLiveWeather(activeField.latitude, activeField.longitude);
      if (isMounted) {
        setLiveWeather(w);
        setWeatherLoading(false);
      }
    }
    loadWeather();
    // Refresh weather every 10 minutes
    const timer = setInterval(loadWeather, 600000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [activeField?.latitude, activeField?.longitude]);

  // Simulation Heartbeat Timer
  useEffect(() => {
    if (!isEngineRunning) return;

    const ms = simulationSpeed === 'fast' ? 1000 : simulationSpeed === 'slow' ? 6000 : 3000;
    const interval = setInterval(() => {
      setZones(prevZones => {
        return prevZones.map(z => {
          let updatedWater = z.soilWater;

          if (z.id === 'zone2') {
            if (isDecliningZone2) {
              if (updatedWater > 24.2) {
                updatedWater = parseFloat((updatedWater - 0.4).toFixed(1));
              }
            } else if (isIrrigatingZone2) {
              if (updatedWater < 38.0) {
                updatedWater = parseFloat((updatedWater + 1.2).toFixed(1));
              } else {
                setIsIrrigatingZone2(false); // Finished watering
              }
            } else {
              // Gentle micro variation
              updatedWater = parseFloat((updatedWater + (Math.random() - 0.5) * 0.08).toFixed(1));
            }
          } else {
            updatedWater = parseFloat((updatedWater + (Math.random() - 0.5) * 0.06).toFixed(1));
          }

          // Determine simple farmer-friendly status (Good, Watch, Needs Water)
          let status = 'Good';
          if (updatedWater < 25.0) {
            status = 'Needs Water';
          } else if (updatedWater < 40.0) {
            status = 'Watch';
          }

          // Log to simulated raw sensor feed
          firebaseBridge.addSensorReading({
            sensorId: z.sensorId || 'SM-Z02',
            zoneId: z.name,
            parameter: 'Soil Water',
            value: updatedWater,
            unit: '%',
            status: 'OK'
          });

          return {
            ...z,
            soilWater: updatedWater,
            status
          };
        });
      });
    }, ms);

    return () => clearInterval(interval);
  }, [isEngineRunning, simulationSpeed, isDecliningZone2, isIrrigatingZone2]);

  // Derived Aggregate Values for Home Dashboard
  const avgSoilWater = zones.length > 0
    ? (zones.reduce((sum, z) => sum + (z.soilWater || 0), 0) / zones.length).toFixed(0)
    : '34';

  const z2 = zones.find(z => z.id === 'zone2') || zones[1] || zones[0];
  const z2Water = z2?.soilWater ?? 24.2;

  // Simple Overall Field Status (PRD Section 11)
  let fieldStatusText = 'Good';
  let fieldStatusMessage = 'Your crop currently looks okay.';
  let fieldStatusBadge = '🟢 Good';

  if (liveWeather.rainfall > 5.0) {
    fieldStatusText = 'Rain Occurring';
    fieldStatusMessage = 'Rain may reduce the need for watering today.';
    fieldStatusBadge = '🔵 Rain';
  } else if (z2Water < 25.0) {
    fieldStatusText = 'Needs Water';
    fieldStatusMessage = 'Soil water in Zone 2 is low. Watering recommended.';
    fieldStatusBadge = '🔴 Needs Water';
  } else if (z2Water < 40.0) {
    fieldStatusText = 'Watch';
    fieldStatusMessage = 'Soil water is getting low in some parts.';
    fieldStatusBadge = '🟡 Watch';
  }

  // Water Need Assessment (PRD Section 10 Card 5)
  const waterNeed = z2Water < 25 ? 'High' : z2Water < 40 ? 'Medium' : 'Low';

  // Crop Condition Assessment (PRD Section 10 Card 6)
  const cropCondition = z2Water < 25 ? 'Needs Attention' : z2Water < 35 ? 'Moderate' : 'Good';

  // Simple Farmer Recommendation (PRD Section 15)
  const simpleRecommendation = z2Water < 25
    ? {
        title: '💧 WATER NEEDED',
        text: 'Zone 2 may need water soon.',
        reason: 'Soil water is going down and little rain is expected in the forecast.',
        action: 'Water Zone 2'
      }
    : z2Water < 40
    ? {
        title: '🟡 WATCH WATER',
        text: 'Soil water is moderate in Zone 2.',
        reason: 'Keep an eye on the weather forecast before next irrigation.',
        action: 'Check Weather'
      }
    : {
        title: '🟢 FIELD HYDRATED',
        text: 'No watering needed today.',
        reason: 'All zones have enough soil water for healthy crop growth.',
        action: 'All Good'
      };

  // Farmer-Friendly Virtual Irrigation Action (PRD Section 21)
  const waterZone2 = () => {
    setIsDecliningZone2(false);
    setIsIrrigatingZone2(true);
  };

  // Demo Triggers (Presentation Mode)
  const triggerLowMoisture = () => {
    setIsDecliningZone2(true);
    setIsIrrigatingZone2(false);
  };

  const resetDemo = () => {
    setIsDecliningZone2(false);
    setIsIrrigatingZone2(false);
    setActiveScenario('normal');
    setCurrentEventIndex(0);
    setZones(prev => prev.map((z, idx) => ({
      ...z,
      soilWater: idx === 1 ? 41.5 : idx === 0 ? 41.2 : idx === 2 ? 38.0 : 43.5,
      status: 'Good'
    })));
  };

  return (
    <TelemetryContext.Provider value={{
      liveWeather,
      weatherLoading,
      zones,
      avgSoilWater,
      z2Water,
      fieldStatusText,
      fieldStatusMessage,
      fieldStatusBadge,
      waterNeed,
      cropCondition,
      simpleRecommendation,
      waterZone2,
      isIrrigatingZone2,
      // Demo Controls
      simulationSpeed,
      setSimulationSpeed,
      isEngineRunning,
      setIsEngineRunning,
      activeScenario,
      setActiveScenario,
      triggerLowMoisture,
      resetDemo,
      historyBuffer,
      // Presentation Stepper
      isPresentationMode,
      setIsPresentationMode,
      currentEventIndex,
      setCurrentEventIndex
    }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) throw new Error('useTelemetry must be used within a TelemetryProvider');
  return context;
}
