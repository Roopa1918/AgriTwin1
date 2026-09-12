// AgriTwin — Farmer-Friendly Login Page (PRD Section 2)
// Clean agricultural visual style with mobile/email login, create account, and 1-click Demo Mode.

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sparkles, Eye, EyeOff, ShieldCheck, Leaf } from 'lucide-react';

export default function Login() {
  const { login, loginDemo, loading } = useAuth();
  const [identifier, setIdentifier] = useState('9876543210'); // Mobile or Email
  const [password, setPassword] = useState('farmer123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(identifier, password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #0d2e22 0%, #071711 70%, #040c09 100%)',
      padding: '20px',
      position: 'relative'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(12, 28, 21, 0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 32px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6), var(--glow-emerald)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '14px',
            background: 'rgba(16, 185, 129, 0.15)',
            borderRadius: '50%',
            border: '2px solid rgba(16, 185, 129, 0.35)',
            marginBottom: '14px'
          }}>
            <img src="/favicon.svg" alt="AgriTwin" style={{ width: '44px', height: '44px' }} />
          </div>

          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            AgriTwin
          </h1>
          <p style={{ color: 'var(--emerald-400)', fontSize: '0.92rem', fontWeight: 600, marginTop: '2px' }}>
            Digital Twin for Smart Agriculture
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
            “Simple Farming Decisions from Smart Field Data”
          </span>
        </div>

        {/* Login / Sign Up Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
              Mobile Number or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="e.g. 9876543210 or farmer@farm.com"
              style={{
                width: '100%',
                background: 'rgba(5, 14, 10, 0.85)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('Demo reset: You can sign in with your credentials or 1-Click Demo Mode below.')}
                style={{ background: 'none', border: 'none', color: 'var(--emerald-400)', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'rgba(5, 14, 10, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 42px 12px 14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '1rem', marginTop: '6px' }}
          >
            <span>{isSignUp ? 'Create Farmer Account' : 'Login to My Field'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Toggle Sign Up / Login */}
        <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.84rem' }}>
          <button
            onClick={() => setIsSignUp(p => !p)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isSignUp ? 'Already have an account? Login here' : 'Don\'t have an account? Create Account'}
          </button>
        </div>

        {/* Divider */}
        <div style={{ margin: '22px 0 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            College Presentation / Quick Start
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* 1-Click Demo Mode */}
        <button
          onClick={loginDemo}
          disabled={loading}
          className="btn btn-secondary"
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.2) 100%)',
            borderColor: 'rgba(52, 211, 153, 0.45)',
            color: '#fff',
            fontWeight: 700
          }}
        >
          <Sparkles size={16} color="var(--emerald-400)" />
          <span>Launch 1-Click Demo Mode (Presenter)</span>
        </button>
      </div>
    </div>
  );
}
