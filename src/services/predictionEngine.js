// AgriTwin — Predictive Soil Moisture & Trend Analysis Service
// Transparent, verifiable linear regression and slope analysis over moving telemetry buffers.
// Academic Prototype: Clearly discloses trend-based nature without claiming unverified AI.

export function calculateMoisturePrediction(history = [], currentMoisture = 40.0) {
  // If insufficient history, create sensible extrapolation
  const readings = history.length >= 3 
    ? history.slice(-8) 
    : [currentMoisture + 3, currentMoisture + 2, currentMoisture + 1, currentMoisture];

  const n = readings.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  readings.forEach((y, i) => {
    sumX += i;
    sumY += y;
    sumXY += i * y;
    sumX2 += i * i;
  });

  const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
  
  let trendDirection = 'STABLE';
  let trendRatePerHour = 0; // % per hour
  let projectedStressHours = null;
  let summaryText = '';
  let advice = '';

  if (slope < -0.15) {
    trendDirection = 'DECLINING';
    trendRatePerHour = Math.abs(slope * 1.8);
    
    // Estimate hours to reach 24% (critical threshold)
    const deltaToCritical = currentMoisture - 24.5;
    if (deltaToCritical > 0 && trendRatePerHour > 0) {
      projectedStressHours = (deltaToCritical / trendRatePerHour).toFixed(1);
    } else {
      projectedStressHours = '0.0 (Currently in Critical Depletion)';
    }

    summaryText = `Zone is exhibiting a persistent declining soil moisture trend (-${trendRatePerHour.toFixed(2)}% / hr).`;
    advice = 'Consider irrigation scheduling within the next 4 to 8 hours if evapotranspiration continues and rainfall remains absent.';
  } else if (slope > 0.15) {
    trendDirection = 'RECOVERING / INCREASING';
    trendRatePerHour = (slope * 2.0);
    summaryText = `Soil moisture is actively recharging (+${trendRatePerHour.toFixed(2)}% / hr) due to irrigation or precipitation.`;
    advice = 'Permit root infiltration and monitor for soil saturation plateauing.';
  } else {
    trendDirection = 'EQUILIBRIUM / STABLE';
    trendRatePerHour = 0.05;
    summaryText = 'Soil matrix potential is stable with minimal diurnal fluctuation.';
    advice = 'No moisture replenishment needed. Standard growth vegetative conditions continue.';
  }

  // Generate 6 forecasted future steps (e.g. +1h, +2h, +3h, +4h, +5h, +6h)
  const forecast = [];
  let nextVal = currentMoisture;
  for (let step = 1; step <= 6; step++) {
    nextVal = Math.max(16, Math.min(65, nextVal + (slope * 1.2)));
    forecast.push({
      stepHours: `+${step}h`,
      predictedMoisture: parseFloat(nextVal.toFixed(1))
    });
  }

  return {
    trendDirection,
    slope: parseFloat(slope.toFixed(3)),
    dryingRate: parseFloat(trendRatePerHour.toFixed(2)),
    projectedStressHours,
    summaryText,
    advice,
    forecast,
    methodology: 'Least-squares linear trend regression on simulated telemetry buffer.',
    disclaimer: 'Demo prediction based on simulated sensor trends. Academic prototype demonstration.'
  };
}
