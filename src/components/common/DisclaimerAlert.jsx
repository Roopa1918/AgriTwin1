// AgriTwin — Academic Prototype Disclaimer Component (PRD Section 46)
import React from 'react';
import { Info } from 'lucide-react';

export default function DisclaimerAlert({ message = null, style = {} }) {
  return (
    <div style={{
      background: 'rgba(56, 189, 248, 0.08)',
      border: '1px solid rgba(56, 189, 248, 0.25)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      fontSize: '0.82rem',
      color: '#bae6fd',
      lineHeight: 1.45,
      ...style
    }}>
      <Info size={18} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <strong>Academic Demonstration Notice: </strong>
        {message || 'This application is an academic Digital Twin prototype. Sensor readings and scenario outputs shown in Demo Mode are simulated for demonstration purposes and should not be used as direct agronomic prescriptions.'}
      </div>
    </div>
  );
}
