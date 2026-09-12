// AgriTwin — Automated Decision Support & Irrigation Recommendation Engine
// Generates contextual agricultural guidance based on simulated sensor readings,
// soil moisture trends, atmospheric evaporative demand, and climate scenarios.

import { DEMO_THRESHOLDS } from '../data/demoConfiguration';

export function evaluateZoneIrrigation({
  zoneId,
  zoneName,
  soilMoisture,
  moistureTrend = 'stable', // 'decreasing' | 'stable' | 'increasing'
  temperature = 28.5,
  humidity = 55.0,
  rainfall = 0.0,
  climateScenario = 'normal',
  thresholds = DEMO_THRESHOLDS
}) {
  const moistureGood = thresholds?.moisture?.good ?? 40.0;
  const moistureMod = thresholds?.moisture?.moderate ?? 25.0;
  const tempWarn = thresholds?.temperature?.warning ?? 34.0;

  // Determine priority & message
  let priority = 'LOW';
  let recommendation = 'No immediate irrigation required.';
  let reason = 'Soil moisture levels are within the optimal target range for the current maize growth stage.';
  let actionableAdvice = 'Maintain standard monitoring schedule. Soil matrix potential is adequate.';
  let waterStress = 'Low';

  // Critical Low Condition
  if (soilMoisture < moistureMod) {
    priority = 'HIGH';
    waterStress = 'High';
    recommendation = `Soil moisture in ${zoneName || zoneId} is critical (${soilMoisture.toFixed(1)}%). Irrigation strongly recommended.`;
    reason = `Moisture has fallen below the critical demo threshold (${moistureMod}%). Continuous crop transpiration without recharge will cause permanent wilting.`;
    actionableAdvice = `Initiate micro-sprinkler cycle in ${zoneName || zoneId} for 45 minutes to restore root-zone field capacity.`;
  }
  // Moderate / Declining condition
  else if (soilMoisture <= moistureGood || moistureTrend === 'decreasing' || climateScenario === 'hotDry') {
    if (rainfall > 3.0) {
      priority = 'LOW';
      waterStress = 'Low';
      recommendation = `Rainfall event detected (${rainfall.toFixed(1)} mm). Irrigation deferred.`;
      reason = 'Natural precipitation is actively recharging soil moisture reserves.';
      actionableAdvice = 'Suspend automated irrigation cycles and monitor soil infiltration rate.';
    } else if (temperature >= tempWarn || climateScenario === 'hotDry' || climateScenario === 'extremeDry') {
      priority = 'HIGH';
      waterStress = 'Moderate-High';
      recommendation = `Elevated heat stress & moisture decline in ${zoneName || zoneId}. Irrigation recommended.`;
      reason = `Atmospheric vapor pressure deficit is high due to ambient temperature (${temperature.toFixed(1)}°C) and reduced humidity.`;
      actionableAdvice = `Schedule evening drip irrigation to minimize evaporative losses and alleviate canopy water stress.`;
    } else if (moistureTrend === 'decreasing') {
      priority = 'MEDIUM';
      waterStress = 'Moderate';
      recommendation = `Soil moisture in ${zoneName || zoneId} is decreasing (${soilMoisture.toFixed(1)}%). Irrigation may be required.`;
      reason = `Soil moisture exhibits a steady negative gradient (-0.8%/hr) with no imminent precipitation.`;
      actionableAdvice = `Prepare irrigation pumps and check line pressure for planned delivery.`;
    } else {
      priority = 'MEDIUM';
      waterStress = 'Moderate';
      recommendation = `Moisture levels in ${zoneName || zoneId} are moderate (${soilMoisture.toFixed(1)}%). Continue monitoring.`;
      reason = `Soil moisture is within allowable depletion thresholds but approaching replenish trigger.`;
      actionableAdvice = 'Review evapotranspiration forecasts before triggering irrigation cycles.';
    }
  }

  return {
    zoneId,
    zoneName: zoneName || zoneId,
    priority,
    recommendation,
    reason,
    waterStress,
    actionableAdvice,
    timestamp: new Date().toLocaleTimeString(),
    disclaimer: 'Academic Digital Twin prototype advisory. Based on simulated telemetry; not an agronomic prescription.'
  };
}
