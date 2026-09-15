// AgriTwin — Robust React Error Boundary Component
// Prevents any single component or library error (Three.js, Leaflet, Firebase, etc.)
// from crashing the entire application to a blank page.

import React from 'react';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AgriTwin ErrorBoundary caught an error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function' 
          ? this.props.fallback(this.state.error, this.handleReset)
          : this.props.fallback;
      }

      // Feature-level compact fallback
      if (this.props.compact) {
        return (
          <div style={{
            padding: '24px 18px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-lg, 12px)',
            textAlign: 'center',
            color: '#f87171'
          }}>
            <AlertTriangle size={24} style={{ margin: '0 auto 8px', display: 'block', color: '#f87171' }} />
            <strong style={{ fontSize: '0.95rem', display: 'block', color: '#fff', marginBottom: '4px' }}>
              {this.props.title || 'Some field information could not be loaded.'}
            </strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '0 0 14px' }}>
              Some field information could not be loaded.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={14} />
              <span>Try Again</span>
            </button>
          </div>
        );
      }

      // Full-page friendly farmer error fallback
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 20%, #0d2e22 0%, #061811 70%, #030a07 100%)',
          color: '#fff',
          padding: '24px 16px',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            maxWidth: '460px',
            background: 'rgba(11, 26, 19, 0.95)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <span style={{ fontSize: '2.8rem', display: 'block', marginBottom: '10px' }}>🌱</span>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              AgriTwin Safety Fallback
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
              A display issue occurred, but your field data and farm settings remain completely safe.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '100%'
            }}>
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 700
                }}
              >
                <RotateCcw size={16} />
                <span>Reload AgriTwin</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Home size={16} />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
