// AgriTwin — Climate Scenario Simulation Service
// Models the hypothetical impact of elevated temperatures and reduced precipitation
// on agricultural root-zone moisture, crop water stress, and irrigation frequency.

export const CLIMATE_SCENARIOS = {
  baseline: {
    id: 'baseline',
    name: 'Baseline (Current Microclimate)',
    tempDelta: 0,
    rainDeltaPercent: 0,
    humidityDeltaPercent: 0,
    description: 'Current seasonal average conditions for the campus agro-ecological zone.',
    color: '#10b981'
  },
  warmer: {
    id: 'warmer',
    name: 'Warmer (+1.5°C)',
    tempDelta: 1.5,
    rainDeltaPercent: -5,
    humidityDeltaPercent: -5,
    description: 'Moderate near-term warming scenario with slightly elevated evapotranspiration.',
    color: '#f59e0b'
  },
  hotDry: {
    id: 'hotDry',
    name: 'Hot & Dry (+3.0°C, -20% Rain)',
    tempDelta: 3.0,
    rainDeltaPercent: -20,
    humidityDeltaPercent: -10,
    description: 'Severe seasonal heatwave scenario with significant moisture depletion.',
    color: '#f97316'
  },
  extremeDry: {
    id: 'extremeDry',
    name: 'Extreme Dry (+5.0°C, -50% Rain)',
    tempDelta: 5.0,
    rainDeltaPercent: -50,
    humidityDeltaPercent: -20,
    description: 'Worst-case prolonged drought stress model testing crop resilience boundaries.',
    color: '#ef4444'
  }
};

export function calculateScenarioImpact(scenarioKey = 'baseline', currentTelemetry = {}) {
  const scenario = CLIMATE_SCENARIOS[scenarioKey] || CLIMATE_SCENARIOS.baseline;
  const currentTemp = currentTelemetry.temperature || 28.5;
  const currentRain = currentTelemetry.rainfall || 0.0;
  const currentMoisture = currentTelemetry.moisture || 36.8;

  const simulatedTemp = parseFloat((currentTemp + scenario.tempDelta).toFixed(1));
  const simulatedRain = currentRain > 0 
    ? Math.max(0, parseFloat((currentRain * (1 + scenario.rainDeltaPercent / 100)).toFixed(1)))
    : 0;

  // Evaporation acceleration factor
  const evapMultiplier = 1 + (scenario.tempDelta * 0.08) - (scenario.humidityDeltaPercent * 0.005);
  const moistureDeclineProjected = parseFloat((scenario.tempDelta * 2.4 - (scenario.rainDeltaPercent * 0.15)).toFixed(1));
  const expectedMoisture = Math.max(14, parseFloat((currentMoisture - moistureDeclineProjected).toFixed(1)));

  // Water Stress & Irrigation Priority
  let waterStress = 'Low';
  let irrigationPriority = 'LOW';
  let cropHealthImpact = '-0%';
  let impactSummary = 'Conditions remain within standard agronomic operating limits.';

  if (scenarioKey === 'warmer') {
    waterStress = 'Moderate';
    irrigationPriority = 'MEDIUM';
    cropHealthImpact = '-6%';
    impactSummary = 'Elevated daytime transpiration necessitates more frequent shallow irrigation.';
  } else if (scenarioKey === 'hotDry') {
    waterStress = 'HIGH';
    irrigationPriority = 'HIGH';
    cropHealthImpact = '-18%';
    impactSummary = 'The simulated hot and dry scenario increases the risk of severe soil moisture decline and leaf rolling.';
  } else if (scenarioKey === 'extremeDry') {
    waterStress = 'CRITICAL / SEVERE';
    irrigationPriority = 'EMERGENCY / CRITICAL';
    cropHealthImpact = '-34%';
    impactSummary = 'Extreme thermal stress exceeds root recharge capacity; yield reduction imminent without automated precision irrigation.';
  }

  return {
    scenario,
    simulatedTemp,
    simulatedRain,
    expectedMoisture,
    evapMultiplier: parseFloat(evapMultiplier.toFixed(2)),
    waterStress,
    irrigationPriority,
    cropHealthImpact,
    impactSummary,
    disclaimer: 'SIMULATED SCENARIO RESULT — Hypothetical demonstration model. Not an actual weather forecast.'
  };
}
