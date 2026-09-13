// AgriTwin — My Fields Multi-Farm Management (PRD Section 16 & 26)
import React from 'react';
import { useFields } from '../context/FieldsContext';
import { MapPin, Plus, CheckCircle2, Trash2, ArrowRight, Eye, Sparkles } from 'lucide-react';

export default function MyFields({ setTab, onOpenAddField }) {
  const { fields, activeFieldId, setActiveFieldId, deleteField } = useFields();

  const handleOpenField = (fieldId) => {
    setActiveFieldId(fieldId);
    setTab('home');
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>🌾 My Fields</h1>
          <p>
            Choose an agricultural field to monitor its environment, soil moisture, and 3D Digital Twin.
          </p>
        </div>

        <button onClick={onOpenAddField} className="btn btn-primary" style={{ fontWeight: 700 }}>
          <Plus size={18} />
          <span>+ Add New Field</span>
        </button>
      </div>

      {fields.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--bg-surface-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🌾</span>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 700 }}>No Fields Added Yet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '420px', margin: '8px auto 20px' }}>
            Choose where your agricultural field is located to activate your Digital Twin.
          </p>
          <button onClick={onOpenAddField} className="btn btn-primary" style={{ padding: '12px 26px', fontWeight: 700 }}>
            <Plus size={18} />
            <span>Select Your Field</span>
          </button>
        </div>
      ) : (
        /* Fields List Grid — PRD Section 16 */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
          {fields.map(field => {
            const isActive = field.id === activeFieldId;

            return (
              <div
                key={field.id}
                style={{
                  background: isActive ? 'rgba(16, 185, 129, 0.14)' : 'var(--bg-surface-card)',
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
                {/* Active Pill */}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'var(--emerald-500)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <CheckCircle2 size={12} /> ACTIVE
                  </span>
                )}

                {/* Field Title & Crop */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}>
                    {field.cropIcon || '🌾'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>{field.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--emerald-400)', fontSize: '0.84rem', marginTop: '2px' }}>
                      <MapPin size={13} />
                      <span>{field.village || 'Field Location'}</span>
                    </div>
                  </div>
                </div>

                {/* Acreage & Coordinates */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: 'var(--radius-lg)' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.74rem', display: 'block' }}>Farm Area</span>
                    <strong style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>{field.area}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.74rem', display: 'block' }}>GPS Coordinates</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                      {field.latitude?.toFixed(3)}°N, {field.longitude?.toFixed(3)}°E
                    </span>
                  </div>
                </div>

                {/* 4 Dynamic Zones Status */}
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    4 Zones Soil Moisture:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', fontSize: '0.76rem' }}>
                    {field.zones?.map((z, idx) => (
                      <div key={z.id} style={{ background: 'rgba(0,0,0,0.25)', padding: '6px 4px', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.68rem' }}>{z.shortName || `Z${idx + 1}`}</span>
                        <strong style={{ color: z.soilWater < 25 ? '#f87171' : z.soilWater < 40 ? '#fbbf24' : '#34d399' }}>
                          {z.soilWater?.toFixed(0)}%
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons — PRD Section 16 [Open Field] */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px' }}>
                  <button 
                    onClick={() => handleOpenField(field.id)}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '11px', fontWeight: 700 }}
                  >
                    <span>{isActive ? 'Open Field' : 'Select & Open Field'}</span>
                    <ArrowRight size={16} />
                  </button>

                  {fields.length > 1 && (
                    <button 
                      onClick={() => deleteField(field.id)}
                      title="Delete field"
                      className="btn btn-danger btn-sm"
                      style={{ padding: '0 12px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
