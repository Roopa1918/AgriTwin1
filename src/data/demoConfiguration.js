// AgriTwin — Field, Sensor, and Demonstration Configuration

export const INITIAL_FIELD_CONFIG = {
  id: 'campusField',
  name: 'Campus Agricultural Field',
  institution: 'Department of Agricultural Engineering',
  location: 'North Research Farm — Sector 4',
  latitude: 13.0827,
  longitude: 80.2707,
  area: '4.5 Hectares',
  crop: 'Maize (Zea mays)',
  cropVariety: 'Hybrid Ganga-5',
  sowingDate: '2026-06-15',
  growthStage: 'V6 (Vegetative / Knee-high)',
  soilType: 'Clay Loam (Field Capacity: 38%, Wilting Point: 18%)',
  irrigationType: 'Precision Micro-Sprinkler & Drip Array',
  numberOfZones: 4,
  boundaryPolygon: [
    [13.0835, 80.2698],
    [13.0835, 80.2718],
    [13.0818, 80.2718],
    [13.0818, 80.2698]
  ]
};

export const INITIAL_ZONES = [
  {
    id: 'zone1',
    name: 'Zone 1 — North-West',
    shortName: 'Zone 1',
    area: '1.1 ha',
    sensorId: 'SM-Z01',
    moisture: 42.4,
    temperature: 28.6,
    humidity: 58.2,
    pH: 6.8,
    ec: 1.2,
    rainfall: 0,
    health: 91,
    waterStress: 'Low',
    irrigationNeeded: false,
    irrigationPriority: 'LOW',
    status: 'GOOD',
    coords: { x: -3.2, z: -3.2 },
    latLng: [13.0831, 80.2703]
  },
  {
    id: 'zone2',
    name: 'Zone 2 — North-East (Demo Target)',
    shortName: 'Zone 2',
    area: '1.2 ha',
    sensorId: 'SM-Z02',
    moisture: 41.8, // starts healthy, will decline during demo
    temperature: 28.8,
    humidity: 57.5,
    pH: 6.7,
    ec: 1.3,
    rainfall: 0,
    health: 88,
    waterStress: 'Low',
    irrigationNeeded: false,
    irrigationPriority: 'LOW',
    status: 'GOOD',
    coords: { x: 3.2, z: -3.2 },
    latLng: [13.0831, 80.2713]
  },
  {
    id: 'zone3',
    name: 'Zone 3 — South-West',
    shortName: 'Zone 3',
    area: '1.1 ha',
    sensorId: 'SM-Z03',
    moisture: 38.6,
    temperature: 29.1,
    humidity: 56.4,
    pH: 6.6,
    ec: 1.1,
    rainfall: 0,
    health: 84,
    waterStress: 'Moderate',
    irrigationNeeded: false,
    irrigationPriority: 'MEDIUM',
    status: 'MODERATE',
    coords: { x: -3.2, z: 3.2 },
    latLng: [13.0822, 80.2703]
  },
  {
    id: 'zone4',
    name: 'Zone 4 — South-East',
    shortName: 'Zone 4',
    area: '1.1 ha',
    sensorId: 'SM-Z04',
    moisture: 45.2,
    temperature: 28.3,
    humidity: 60.1,
    pH: 6.9,
    ec: 1.2,
    rainfall: 0,
    health: 94,
    waterStress: 'Low',
    irrigationNeeded: false,
    irrigationPriority: 'LOW',
    status: 'GOOD',
    coords: { x: 3.2, z: 3.2 },
    latLng: [13.0822, 80.2713]
  }
];

export const INITIAL_SENSORS = [
  {
    sensorId: 'SM-Z01',
    name: 'Soil Moisture Probe Z1',
    type: 'Soil Moisture',
    category: 'soil',
    parameter: 'Volumetric Water Content',
    zoneId: 'zone1',
    zoneName: 'Zone 1',
    value: 42.4,
    unit: '%',
    status: 'Online',
    battery: 98,
    rssi: -62,
    model: 'Decagon 10HS Sim'
  },
  {
    sensorId: 'SM-Z02',
    name: 'Soil Moisture Probe Z2 (Demo Focus)',
    type: 'Soil Moisture',
    category: 'soil',
    parameter: 'Volumetric Water Content',
    zoneId: 'zone2',
    zoneName: 'Zone 2',
    value: 41.8,
    unit: '%',
    status: 'Online',
    battery: 95,
    rssi: -58,
    model: 'Decagon 10HS Sim'
  },
  {
    sensorId: 'SM-Z03',
    name: 'Soil Moisture Probe Z3',
    type: 'Soil Moisture',
    category: 'soil',
    parameter: 'Volumetric Water Content',
    zoneId: 'zone3',
    zoneName: 'Zone 3',
    value: 38.6,
    unit: '%',
    status: 'Online',
    battery: 92,
    rssi: -65,
    model: 'Decagon 10HS Sim'
  },
  {
    sensorId: 'SM-Z04',
    name: 'Soil Moisture Probe Z4',
    type: 'Soil Moisture',
    category: 'soil',
    parameter: 'Volumetric Water Content',
    zoneId: 'zone4',
    zoneName: 'Zone 4',
    value: 45.2,
    unit: '%',
    status: 'Online',
    battery: 96,
    rssi: -60,
    model: 'Decagon 10HS Sim'
  },
  {
    sensorId: 'TEMP-01',
    name: 'Ambient Air Temperature',
    type: 'Weather',
    category: 'weather',
    parameter: 'Temperature',
    zoneId: 'field',
    zoneName: 'Campus Field Mast',
    value: 28.8,
    unit: '°C',
    status: 'Online',
    battery: 100,
    rssi: -52,
    model: 'Sensirion SHT35 Sim'
  },
  {
    sensorId: 'HUM-01',
    name: 'Relative Humidity',
    type: 'Weather',
    category: 'weather',
    parameter: 'Humidity',
    zoneId: 'field',
    zoneName: 'Campus Field Mast',
    value: 57.8,
    unit: '%',
    status: 'Online',
    battery: 100,
    rssi: -52,
    model: 'Sensirion SHT35 Sim'
  },
  {
    sensorId: 'RAIN-01',
    name: 'Tipping Bucket Rain Gauge',
    type: 'Weather',
    category: 'weather',
    parameter: 'Rainfall',
    zoneId: 'field',
    zoneName: 'Campus Field Mast',
    value: 0.0,
    unit: 'mm',
    status: 'Online',
    battery: 99,
    rssi: -54,
    model: 'Davis AeroCone Sim'
  },
  {
    sensorId: 'WIND-01',
    name: 'Anemometer & Vane',
    type: 'Weather',
    category: 'weather',
    parameter: 'Wind Speed',
    zoneId: 'field',
    zoneName: 'Campus Field Mast',
    value: 8.4,
    unit: 'km/h',
    status: 'Online',
    battery: 97,
    rssi: -55,
    model: 'Gill WindSonic Sim'
  },
  {
    sensorId: 'SOLAR-01',
    name: 'Solar Pyranometer',
    type: 'Weather',
    category: 'weather',
    parameter: 'Solar Radiation',
    zoneId: 'field',
    zoneName: 'Campus Field Mast',
    value: 685,
    unit: 'W/m²',
    status: 'Online',
    battery: 100,
    rssi: -53,
    model: 'Apogee SP-110 Sim'
  },
  {
    sensorId: 'PH-01',
    name: 'Soil pH Probe',
    type: 'Soil',
    category: 'soil',
    parameter: 'Soil pH',
    zoneId: 'field',
    zoneName: 'Central Soil Station',
    value: 6.7,
    unit: 'pH',
    status: 'Online',
    battery: 91,
    rssi: -67,
    model: 'Vernier pH-BTA Sim'
  },
  {
    sensorId: 'EC-01',
    name: 'Soil EC Probe',
    type: 'Soil',
    category: 'soil',
    parameter: 'Electrical Conductivity',
    zoneId: 'field',
    zoneName: 'Central Soil Station',
    value: 1.25,
    unit: 'dS/m',
    status: 'Online',
    battery: 93,
    rssi: -66,
    model: 'Decagon GS3 Sim'
  }
];

export const DEMO_THRESHOLDS = {
  moisture: {
    good: 40.0,      // Above 40% = GOOD
    moderate: 25.0,  // 25% - 40% = MODERATE
    critical: 24.5   // Below 25% = LOW / CRITICAL
  },
  temperature: {
    normal: 30.0,
    warning: 34.0,
    critical: 38.0
  },
  humidity: {
    low: 30.0,
    high: 85.0
  }
};

export const PRESENTATION_EVENTS = [
  {
    id: 1,
    title: 'Normal Field Baseline',
    shortDesc: 'All 4 zones optimal, SM-Z02 at 42%, temperature 28°C.',
    action: 'reset',
    hint: 'Showcase synchronized 3D twin, live incoming telemetry, healthy green crop rows.'
  },
  {
    id: 2,
    title: 'Moisture Starts Declining',
    shortDesc: 'Zone 2 moisture begins gradual decrease (41% → 35%).',
    action: 'start_decline',
    hint: 'Highlight real-time listener receiving gradual decaying readings from simulator.'
  },
  {
    id: 3,
    title: 'Zone 2 Enters Low Moisture (<25%)',
    shortDesc: 'Zone 2 reaches 24.2% moisture; turns Red on 3D Twin.',
    action: 'critical_moisture',
    hint: 'Audience sees 3D Zone 2 pulsate red and automated Alert triggered.'
  },
  {
    id: 4,
    title: 'Automated Irrigation Recommendation',
    shortDesc: 'System fires HIGH priority advisory: Irrigation May Be Required.',
    action: 'recommend_irrigation',
    hint: 'Explain rule-based decision support logic integrating trend, weather, and soil type.'
  },
  {
    id: 5,
    title: 'Hot & Dry Climate Scenario',
    shortDesc: 'Simulate +3°C temp rise, -20% rain; water stress accelerates.',
    action: 'hot_dry_scenario',
    hint: 'Demonstrate climate resilience modeling capability for future drought projections.'
  },
  {
    id: 6,
    title: 'Elevated Water Stress Risk',
    shortDesc: 'Water stress reaches HIGH across vulnerable zone.',
    action: 'high_water_stress',
    hint: 'Show analytics chart illustrating projected moisture deficit trajectory.'
  },
  {
    id: 7,
    title: 'Simulate Virtual Irrigation',
    shortDesc: 'Sprinklers activate in 3D twin; animated water mist sprays.',
    action: 'simulate_irrigation',
    hint: 'Watch particle mist in Three.js and real-time moisture recharge begin.'
  },
  {
    id: 8,
    title: 'Moisture Recovery (24% → 38%)',
    shortDesc: 'Zone 2 rehydrates; color shifts from Crimson to Amber to Green.',
    action: 'complete_recovery',
    hint: 'Active alert auto-resolves and recommendation clears.'
  },
  {
    id: 9,
    title: 'Digital Twin Synchronized',
    shortDesc: 'Full closed-loop workflow demonstrated: IoT → Cloud → Twin → Decision.',
    action: 'sync_complete',
    hint: 'Summarize how physical ESP32 sensors will connect in future production.'
  }
];
