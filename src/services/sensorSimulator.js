// AgriTwin — Agricultural IoT Sensor Simulator Engine
// Generates realistic, physics-correlated sensor telemetry, gradual micro-variations,
// scenario responses, and pipes all updates through the Firebase bridge in real time.

import { firebaseBridge } from './firebase';
import { INITIAL_ZONES, INITIAL_SENSORS, INITIAL_FIELD_CONFIG, DEMO_THRESHOLDS } from '../data/demoConfiguration';
import { evaluateZoneIrrigation } from './recommendationEngine';
import { checkAlertConditions } from './alertEngine';

class SensorSimulatorEngine {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.speed = 'normal'; // 'slow' (6s), 'normal' (3s), 'fast' (1s)
    this.scenario = 'normal'; // 'normal', 'dry', 'hot', 'hotDry', 'rain'
    
    // In-memory working telemetry state
    this.zones = JSON.parse(JSON.stringify(INITIAL_ZONES));
    this.sensors = JSON.parse(JSON.stringify(INITIAL_SENSORS));
    this.field = JSON.parse(JSON.stringify(INITIAL_FIELD_CONFIG));
    this.previousMoisture = {};

    // Specific demonstration flags
    this.isDecliningZone2 = false;
    this.isIrrigatingZone2 = false;
    this.simulatedRainTimeRemaining = 0; // ticks
    this.tickCount = 0;

    // Initialize Firebase documents with baseline data
    this.seedBaseline();
  }

  seedBaseline() {
    firebaseBridge.setDocument('fields', this.field.id, this.field);
    this.zones.forEach(z => firebaseBridge.setDocument('zones', z.id, z));
    this.sensors.forEach(s => firebaseBridge.setDocument('sensors', s.sensorId, s));
  }

  getIntervalMs() {
    switch (this.speed) {
      case 'fast': return 1000;
      case 'slow': return 6000;
      case 'normal':
      default: return 3000;
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.runTick();
    this.intervalId = setInterval(() => this.runTick(), this.getIntervalMs());
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  pause() {
    this.stop();
  }

  resume() {
    this.start();
  }

  setSpeed(newSpeed) {
    this.speed = newSpeed;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  setScenario(newScenario) {
    this.scenario = newScenario;
    if (newScenario === 'hotDry') {
      this.triggerTemperatureRise(4.0);
      this.triggerLowMoisture();
    } else if (newScenario === 'rain') {
      this.triggerRainfall(14.0);
    } else if (newScenario === 'dry') {
      this.triggerLowMoisture();
    }
  }

  // Presentation Trigger 1: Force gradual decline in Zone 2
  triggerLowMoisture() {
    this.isDecliningZone2 = true;
    this.isIrrigatingZone2 = false;
    // Step immediate tick
    this.runTick();
  }

  // Presentation Trigger 2: Ambient heatwave
  triggerTemperatureRise(delta = 4.0) {
    const tempSensor = this.sensors.find(s => s.sensorId === 'TEMP-01');
    if (tempSensor) {
      tempSensor.value = parseFloat((tempSensor.value + delta).toFixed(1));
      firebaseBridge.addSensorReading({
        sensorId: 'TEMP-01',
        zoneId: 'field',
        parameter: 'Temperature',
        value: tempSensor.value,
        unit: '°C'
      });
      firebaseBridge.setDocument('sensors', 'TEMP-01', tempSensor);
    }
  }

  // Presentation Trigger 3: Rainfall shower event
  triggerRainfall(amount = 12.0) {
    const rainSensor = this.sensors.find(s => s.sensorId === 'RAIN-01');
    const humSensor = this.sensors.find(s => s.sensorId === 'HUM-01');
    if (rainSensor) {
      rainSensor.value = amount;
      this.simulatedRainTimeRemaining = 8; // 8 cycles of rain
      firebaseBridge.addSensorReading({
        sensorId: 'RAIN-01',
        zoneId: 'field',
        parameter: 'Rainfall',
        value: amount,
        unit: 'mm'
      });
      firebaseBridge.setDocument('sensors', 'RAIN-01', rainSensor);
    }
    if (humSensor) {
      humSensor.value = Math.min(94, humSensor.value + 20);
      firebaseBridge.setDocument('sensors', 'HUM-01', humSensor);
    }
    // Boost all zones slightly
    this.zones.forEach(z => {
      z.moisture = Math.min(55, z.moisture + 3.5);
    });
  }

  // Presentation Trigger 4: Simulated Sensor Failure
  triggerSensorFailure(sensorId = 'SM-Z02') {
    const s = this.sensors.find(item => item.sensorId === sensorId);
    if (s) {
      s.status = s.status === 'Offline' ? 'Online' : 'Offline';
      firebaseBridge.setDocument('sensors', s.sensorId, s);
      firebaseBridge.addSensorReading({
        sensorId: s.sensorId,
        zoneId: s.zoneId,
        parameter: s.parameter,
        value: s.value,
        unit: s.unit,
        status: s.status === 'Offline' ? 'ERR_TIMEOUT' : 'OK'
      });
      // Trigger alert check
      this.evaluateAlertsAndRecommendations();
    }
  }

  // Presentation Trigger 5: Virtual Irrigation on Zone 2
  triggerIrrigation(zoneId = 'zone2') {
    this.isDecliningZone2 = false;
    this.isIrrigatingZone2 = true;
    const targetZone = this.zones.find(z => z.id === zoneId);
    if (targetZone) {
      targetZone.irrigationActive = true;
    }
    // Re-trigger tick immediately
    this.runTick();
  }

  // Presentation Reset: Restore clean initial baseline
  reset() {
    this.stop();
    this.zones = JSON.parse(JSON.stringify(INITIAL_ZONES));
    this.sensors = JSON.parse(JSON.stringify(INITIAL_SENSORS));
    this.isDecliningZone2 = false;
    this.isIrrigatingZone2 = false;
    this.scenario = 'normal';
    this.simulatedRainTimeRemaining = 0;
    this.tickCount = 0;
    
    // Clear all alerts and seed fresh documents
    firebaseBridge.store.alerts = [];
    firebaseBridge.store.recommendations = [];
    firebaseBridge.store.sensorReadings = [];
    this.seedBaseline();
    this.evaluateAlertsAndRecommendations();
    this.start();
  }

  // Core Tick Cycle: Generates realistic gradual changes
  runTick() {
    this.tickCount++;

    // Track previous moisture for drop rate calculations
    this.zones.forEach(z => {
      this.previousMoisture[z.id] = z.moisture;
    });

    // 1. Weather Gradual Jitter / Scenario Behavior
    const tempSensor = this.sensors.find(s => s.sensorId === 'TEMP-01');
    const humSensor = this.sensors.find(s => s.sensorId === 'HUM-01');
    const rainSensor = this.sensors.find(s => s.sensorId === 'RAIN-01');
    const windSensor = this.sensors.find(s => s.sensorId === 'WIND-01');
    const solarSensor = this.sensors.find(s => s.sensorId === 'SOLAR-01');

    if (tempSensor) {
      // Natural gentle wandering: +/- 0.1°C
      const tempDrift = (Math.random() - 0.5) * 0.15;
      if (this.scenario === 'hotDry') {
        tempSensor.value = Math.min(38.5, parseFloat((tempSensor.value + 0.15).toFixed(1)));
      } else {
        tempSensor.value = parseFloat((tempSensor.value + tempDrift).toFixed(1));
      }
    }

    if (humSensor && tempSensor) {
      // Humidity tends inversely proportional to temp
      const humDrift = (Math.random() - 0.5) * 0.3;
      if (this.scenario === 'hotDry') {
        humSensor.value = Math.max(32, parseFloat((humSensor.value - 0.3).toFixed(1)));
      } else {
        humSensor.value = parseFloat((humSensor.value + humDrift).toFixed(1));
      }
    }

    if (rainSensor) {
      if (this.simulatedRainTimeRemaining > 0) {
        this.simulatedRainTimeRemaining--;
        if (this.simulatedRainTimeRemaining === 0) {
          rainSensor.value = 0.0;
        }
      }
    }

    if (windSensor) {
      windSensor.value = parseFloat((8.0 + Math.sin(this.tickCount * 0.3) * 2.5 + (Math.random() - 0.5)).toFixed(1));
    }

    if (solarSensor) {
      solarSensor.value = Math.round(650 + Math.sin(this.tickCount * 0.1) * 60 + (Math.random() * 20));
    }

    // 2. Zone Moisture Physics & Gradual Progression
    this.zones.forEach(zone => {
      // Micro drift for realistic non-static behavior
      const microJitter = (Math.random() - 0.5) * 0.08;

      if (zone.id === 'zone2') {
        // Controlled demonstration sequence for Zone 2
        if (this.isDecliningZone2) {
          // Gradual step down: e.g. -0.4% per tick until 24.2%
          if (zone.moisture > 24.2) {
            zone.moisture = parseFloat((zone.moisture - 0.45).toFixed(1));
          } else {
            // Plateau at critical demonstration value
            zone.moisture = parseFloat((24.2 + (Math.random() - 0.5) * 0.1).toFixed(1));
          }
        } else if (this.isIrrigatingZone2) {
          // Virtual Irrigation actively increasing moisture to 38.4%
          if (zone.moisture < 38.4) {
            zone.moisture = parseFloat((zone.moisture + 1.2).toFixed(1));
            zone.irrigationActive = true;
          } else {
            zone.moisture = parseFloat((38.4 + microJitter).toFixed(1));
            zone.irrigationActive = false;
            this.isIrrigatingZone2 = false; // completed recovery
          }
        } else {
          zone.moisture = parseFloat((zone.moisture + microJitter).toFixed(1));
        }
      } else {
        // Other zones fluctuate smoothly in optimal range
        if (this.scenario === 'hotDry') {
          zone.moisture = Math.max(26, parseFloat((zone.moisture - 0.08).toFixed(1)));
        } else {
          zone.moisture = parseFloat((zone.moisture + microJitter).toFixed(1));
        }
      }

      // Update Zone status label & health score
      if (zone.moisture >= DEMO_THRESHOLDS.moisture.good) {
        zone.status = 'GOOD';
        zone.health = Math.min(96, Math.round(85 + (zone.moisture - 40) * 1.5));
        zone.waterStress = 'Low';
      } else if (zone.moisture >= DEMO_THRESHOLDS.moisture.moderate) {
        zone.status = 'MODERATE';
        zone.health = Math.round(75 + (zone.moisture - 25) * 0.6);
        zone.waterStress = 'Moderate';
      } else {
        zone.status = 'LOW';
        zone.health = Math.max(45, Math.round(50 + (zone.moisture - 20) * 1.2));
        zone.waterStress = 'High';
      }

      // Synchronize corresponding Soil Moisture sensor
      const sensor = this.sensors.find(s => s.sensorId === zone.sensorId);
      if (sensor && sensor.status !== 'Offline') {
        sensor.value = zone.moisture;
        firebaseBridge.setDocument('sensors', sensor.sensorId, sensor);
        
        // Push to incoming telemetry stream
        firebaseBridge.addSensorReading({
          sensorId: sensor.sensorId,
          zoneId: zone.id,
          parameter: 'Soil Moisture',
          value: zone.moisture,
          unit: '%',
          status: 'OK'
        });
      }

      // Push zone state to Firebase
      firebaseBridge.setDocument('zones', zone.id, zone);
    });

    // 3. Emit Weather Telemetry Readings every tick (or alternating)
    const activeSensorsToEmit = [tempSensor, humSensor, rainSensor, windSensor, solarSensor];
    const chosenSensor = activeSensorsToEmit[this.tickCount % activeSensorsToEmit.length];
    if (chosenSensor && chosenSensor.status !== 'Offline') {
      firebaseBridge.setDocument('sensors', chosenSensor.sensorId, chosenSensor);
      firebaseBridge.addSensorReading({
        sensorId: chosenSensor.sensorId,
        zoneId: chosenSensor.zoneId,
        parameter: chosenSensor.parameter,
        value: chosenSensor.value,
        unit: chosenSensor.unit,
        status: 'OK'
      });
    }

    // 4. Update Simulation State document
    firebaseBridge.setDocument('simulationState', 'active', {
      scenario: this.scenario,
      speed: this.speed,
      isRunning: this.isRunning,
      tick: this.tickCount,
      isDecliningZone2: this.isDecliningZone2,
      isIrrigatingZone2: this.isIrrigatingZone2,
      lastSync: new Date().toISOString()
    });

    // 5. Evaluate alerts & automated recommendations
    this.evaluateAlertsAndRecommendations();
  }

  evaluateAlertsAndRecommendations() {
    const tempVal = this.sensors.find(s => s.sensorId === 'TEMP-01')?.value || 28.5;
    const humVal = this.sensors.find(s => s.sensorId === 'HUM-01')?.value || 55.0;
    const rainVal = this.sensors.find(s => s.sensorId === 'RAIN-01')?.value || 0.0;

    // Check alerts
    const alerts = checkAlertConditions({
      zones: this.zones,
      sensors: this.sensors,
      previousMoistureState: this.previousMoisture,
      thresholds: DEMO_THRESHOLDS
    });

    alerts.forEach(alert => firebaseBridge.addAlert(alert));

    // If Zone 2 has recovered (moisture > 35%), auto-resolve LOW_MOISTURE alerts for Zone 2
    const z2 = this.zones.find(z => z.id === 'zone2');
    if (z2 && z2.moisture >= 35.0) {
      firebaseBridge.resolveAlertsForZone('zone2', 'LOW_MOISTURE');
    }

    // Evaluate Recommendations for each zone
    this.zones.forEach(zone => {
      const isDeclining = (this.previousMoisture[zone.id] - zone.moisture) > 0.1 || (zone.id === 'zone2' && this.isDecliningZone2);
      const rec = evaluateZoneIrrigation({
        zoneId: zone.id,
        zoneName: zone.shortName,
        soilMoisture: zone.moisture,
        moistureTrend: isDeclining ? 'decreasing' : 'stable',
        temperature: tempVal,
        humidity: humVal,
        rainfall: rainVal,
        climateScenario: this.scenario,
        thresholds: DEMO_THRESHOLDS
      });

      firebaseBridge.setRecommendation(rec);
    });
  }
}

export const sensorSimulator = new SensorSimulatorEngine();
export default sensorSimulator;
