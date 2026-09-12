// AgriTwin — Status Pill with Accessible Textual Labeling (PRD Section 49)
import React from 'react';

export default function StatusPill({ status = 'GOOD', label = null }) {
  const normalized = (status || 'GOOD').toUpperCase();
  let className = 'good';

  if (normalized === 'LOW' || normalized === 'CRITICAL' || normalized === 'HIGH_STRESS') {
    className = 'low';
  } else if (normalized === 'MODERATE' || normalized === 'MEDIUM') {
    className = 'moderate';
  } else {
    className = 'good';
  }

  return (
    <span className={`status-pill ${className}`}>
      <span className="pulse-dot" />
      {label || normalized}
    </span>
  );
}
