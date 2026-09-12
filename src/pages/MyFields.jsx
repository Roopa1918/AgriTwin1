// AgriTwin — My Fields Multi-Farm Management (PRD Section 25)
import React from 'react';
import { useFields } from '../context/FieldsContext';
import { MapPin, Plus, CheckCircle2, Trash2, ArrowRight, Eye, Calendar, Crop } from 'lucide-react';

export default function MyFields({ setTab, onOpenAddField }) {
  const { fields, activeFieldId, setActiveFieldId, deleteField } = useFields();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>🌾 My Agricultural Fields</h1>
          <p>
            Manage all your farm plots. Select any field to set it as your active Digital Twin 
            for live weather tracking, soil water monitoring, and watering advice.
          </p>
        </div>

        <button onClick={onOpenAddField} className="btn btn-primary">
          <Plus size={18} />
          <span>+ Add New Field</span>
        </button>
      </div>

      {/* Fields List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {fields.map(field => {
          const isActive = field.id === activeFieldId;

          return (
            <div
              key={field.id}
              style={{
                background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-card)',
                border: `2px solid ${isActive ? 'var(--emerald-400)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? 'var(--glow-emerald)' : 'var(--shadow-md)'
              }}
            >
              {/* Active Badge */}
              {isActive && (
                <span style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'var(--emerald-500)',
                  color: '#fff',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <CheckCircle2 size={12} /> ACTIVE DIGITAL TWIN
                </span>
              )}

              {/* Field Title & Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2.2rem' }}>{field.cropIcon || '🌱'}</span>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>{field.name}</h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Crop: <strong>{field.crop}</strong>
                  </span>
                </div>
              </div>

              {/* Field Metadata Chips */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.84rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', display: 'block' }}>Farm Area</span>
                  <strong style={{ color: '#fff' }}>{field.area}</strong>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', display: 'block' }}>Field Coordinates</span>
                  <strong style={{ color: '#fff', fontSize: '0.8rem' }}>{field.latitude?.toFixed(3)}°N, {field.longitude?.toFixed(3)}°E</strong>
                </div>
              </div>

              {/* 4 Zones Summary */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  4 Dynamic Zones Status:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', fontSize: '0.75rem' }}>
                  {field.zones.map((z, idx) => (
                    <div key={z.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 4px', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ color: 'var(--text-dim)', display: 'block' }}>Z{idx + 1}</span>
                      <strong style={{ color: z.soilWater < 25 ? '#f87171' : z.soilWater < 40 ? '#fbbf24' : '#34d399' }}>
                        {z.soilWater?.toFixed(0)}%
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                {!isActive ? (
                  <button 
                    onClick={() => setActiveFieldId(field.id)}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    <span>Set Active Digital Twin</span>
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <button 
                    onClick={() => setTab('field-monitor')}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    <Eye size={15} />
                    <span>Open Field Monitor</span>
                  </button>
                )}

                {fields.length > 1 && (
                  <button 
                    onClick={() => deleteField(field.id)}
                    title="Delete field"
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
