// AgriTwin — Automated Alert System & Anomaly Detection Engine

import { DEMO_THRESHOLDS } from '../data/demoConfiguration';

export function checkAlertConditions({
  zones,
  sensors,
  previousMoistureState = {},
  thresholds = DEMO_THRESHOLDS
}) {
  const generatedAlerts = [];
  const moistureCritical = thresholds?.moisture?.critical ?? 24.5;
  const tempWarning = thresholds?.temperature?.warning ?? 34.0;

  // 1. Zone-specific checks
  zones.forEach(zone => {
    const prevMoisture = previousMoistureState[zone.id] ?? zone.moisture;
    const dropRate = prevMoisture - zone.moisture;

    // Critical low moisture (< 25%)
    if (zone.moisture <= moistureCritical) {
      generatedAlerts.push({
        zoneId: zone.id,
        zoneName: zone.shortName || zone.name,
        type: 'LOW_MOISTURE',
        severity: 'CRITICAL',
        message: `${zone.shortName || zone.name} soil moisture (${zone.moisture.toFixed(1)}%) has fallen below the configured critical threshold.`,
        recommendedAction: 'Trigger irrigation cycle immediately to avoid permanent crop wilt.'
      });
    }

    // Rapid decline (> 2.0% change in simulation window)
    if (dropRate > 1.8 && zone.moisture > moistureCritical) {
      generatedAlerts.push({
        zoneId: zone.id,
        zoneName: zone.shortName || zone.name,
        type: 'RAPID_DECLINE',
        severity: 'WARNING',
        message: `${zone.shortName || zone.name} soil moisture is decreasing rapidly (-${dropRate.toFixed(1)}%).`,
        recommendedAction: 'Inspect root-zone infiltration and verify soil matrix drainage.'
      });
    }
  });

  // 2. Weather & Sensor network checks
  sensors.forEach(sensor => {
    // Sensor offline
    if (sensor.status === 'Offline') {
      generatedAlerts.push({
        zoneId: sensor.zoneId || 'field',
        zoneName: sensor.zoneName || 'Sensor Network',
        type: 'SENSOR_OFFLINE',
        severity: 'WARNING',
        message: `No recent reading received from sensor ${sensor.sensorId} (${sensor.name}).`,
        recommendedAction: 'Verify ESP32 gateway heartbeat and wireless RSSI transmission.'
      });
    }

    // High temperature
    if (sensor.sensorId === 'TEMP-01' && sensor.value >= tempWarning) {
      generatedAlerts.push({
        zoneId: 'field',
        zoneName: 'Field Weather Station',
        type: 'HIGH_TEMPERATURE',
        severity: 'WARNING',
        message: `Ambient temperature (${sensor.value.toFixed(1)}°C) exceeds the thermal comfort threshold.`,
        recommendedAction: 'Assess crop heat stress index and check evapotranspiration spikes.'
      });
    }

    // Rainfall detection
    if (sensor.sensorId === 'RAIN-01' && sensor.value > 2.0) {
      generatedAlerts.push({
        zoneId: 'field',
        zoneName: 'Field Weather Station',
        type: 'RAINFALL_DETECTED',
        severity: 'INFO',
        message: `Precipitation event detected (${sensor.value.toFixed(1)} mm). Irrigation requirements updated.`,
        recommendedAction: 'Irrigation scheduled for all zones has been automatically postponed.'
      });
    }
  });

  return generatedAlerts;
}
