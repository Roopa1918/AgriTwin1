// AgriTwin — KPI Metric Card Component
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  unit = '',
  icon: Icon,
  status = 'good', // 'good' | 'moderate' | 'low' | 'critical'
  trend = null,    // 'up' | 'down' | 'stable'
  trendText = '',
  footer = null,
  onClick = null
}) {
  const isCritical = status === 'low' || status === 'critical';

  return (
    <div 
      className={`metric-card ${isCritical ? 'critical' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="metric-card-top">
        <span className="metric-card-label">{title}</span>
        {Icon && (
          <div className="metric-card-icon">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="metric-card-value-row">
        <span className="metric-card-value">{value}</span>
        {unit && <span className="metric-card-unit">{unit}</span>}
      </div>

      <div className="metric-card-footer">
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {trend === 'up' && <ArrowUpRight size={14} color="var(--emerald-400)" />}
            {trend === 'down' && <ArrowDownRight size={14} color={isCritical ? '#f87171' : 'var(--emerald-400)'} />}
            {trend === 'stable' && <Minus size={14} color="var(--text-dim)" />}
            <span style={{ color: trend === 'down' && isCritical ? '#f87171' : 'var(--text-muted)' }}>
              {trendText || (trend === 'up' ? 'Rising' : trend === 'down' ? 'Declining' : 'Stable')}
            </span>
          </div>
        )}
        {footer && <div>{footer}</div>}
      </div>
    </div>
  );
}
