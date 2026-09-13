// AgriTwin — Farmer-Friendly Login Page
// Requirements 1–5: Phone Number OTP, Email/Password (Login & Create Account), and Google Sign-In
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Phone, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw,
  Lock,
  AlertCircle
} from 'lucide-react';

export default function Login() {
  const { 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    verifyPhoneOtp, 
    resetPassword, 
    loginDemo, 
    loading, 
    authError, 
    setAuthError 
  } = useAuth();

  // Mode: 'home' (3 options), 'phone', 'otp', 'email', 'register', 'forgot'
  const [authMode, setAuthMode] = useState('home');

  // Phone Form State
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [otpSentNotice, setOtpSentNotice] = useState(false);

  // Email Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval = null;
    if (timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(c => c - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  const clearErrors = () => {
    if (setAuthError) setAuthError(null);
    setStatusMessage('');
  };

  // 1. Send OTP
  const handleSendOtp = (e) => {
    e.preventDefault();
    clearErrors();
    const cleanNum = phoneNumber.replace(/\D/g, '');
    if (cleanNum.length < 8) {
      setStatusMessage('Please enter a valid mobile number.');
      return;
    }
    setOtpSentNotice(true);
    setCountdown(30);
    setTimerActive(true);
    setAuthMode('otp');
  };

  // 1b. Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearErrors();
    const fullPhone = `${countryCode} ${phoneNumber}`;
    try {
      await verifyPhoneOtp(fullPhone, otpCode.trim());
    } catch (err) {
      // Auth context sets plain error
    }
  };

  // 1c. Resend OTP
  const handleResendOtp = () => {
    if (countdown > 0) return;
    setCountdown(30);
    setTimerActive(true);
    setOtpSentNotice(true);
  };

  // 2. Email Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    clearErrors();
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      setStatusMessage('Incorrect email or password. Please try again.');
    }
  };

  // 2b. Email Register
  const handleEmailRegister = async (e) => {
    e.preventDefault();
    clearErrors();
    if (password.length < 6) {
      setStatusMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setStatusMessage('Passwords do not match.');
      return;
    }
    try {
      await registerWithEmail(email, password);
    } catch (err) {
      setStatusMessage('Registration failed. Please try a different email.');
    }
  };

  // 2c. Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearErrors();
    if (!email) {
      setStatusMessage('Please enter your registered email address.');
      return;
    }
    await resetPassword(email);
    setStatusMessage('Password reset instructions sent to your email.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 15%, #0d2e22 0%, #061811 65%, #030a07 100%)',
      padding: '24px 16px',
      position: 'relative'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(11, 26, 19, 0.94)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 30px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 35px rgba(16, 185, 129, 0.15)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Brand Header — PRD Requirement 1 */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '14px',
            background: 'rgba(16, 185, 129, 0.12)',
            borderRadius: '50%',
            border: '2px solid rgba(16, 185, 129, 0.35)',
            marginBottom: '14px',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
          }}>
            <img src="/favicon.svg" alt="AgriTwin" style={{ width: '48px', height: '48px' }} />
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>🌱</span> AgriTwin
          </h1>
          <p style={{ color: 'var(--emerald-400)', fontSize: '0.96rem', fontWeight: 700, marginTop: '3px' }}>
            Digital Twin for Smart Agriculture
          </p>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.45 }}>
            “Monitor your field. Understand your crops. Make better decisions.”
          </p>
        </div>

        {/* Global Error Banner */}
        {(authError || statusMessage) && (
          <div style={{
            background: statusMessage.includes('sent') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${statusMessage.includes('sent') ? 'var(--emerald-500)' : '#ef4444'}`,
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            color: statusMessage.includes('sent') ? 'var(--emerald-300)' : '#fca5a5'
          }}>
            {statusMessage.includes('sent') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{authError || statusMessage}</span>
          </div>
        )}

        {/* VIEW 1: HOME (3 Primary Login Choices — PRD Section 2, 3, 4, 5) */}
        {authMode === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Option 1: Continue with Phone */}
            <button
              onClick={() => { clearErrors(); setAuthMode('phone'); }}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Phone size={19} />
              <span>📱 Continue with Phone</span>
            </button>

            {/* Option 2: Continue with Email */}
            <button
              onClick={() => { clearErrors(); setAuthMode('email'); }}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.98rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <Mail size={18} color="var(--emerald-400)" />
              <span>✉️ Continue with Email</span>
            </button>

            {/* Option 3: Continue with Google */}
            <button
              onClick={() => { clearErrors(); loginWithGoogle(); }}
              disabled={loading}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.98rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div style={{ margin: '12px 0 6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ─── OR ───
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.86rem' }}>
              <button
                type="button"
                onClick={() => { clearErrors(); setAuthMode('register'); }}
                style={{ background: 'none', border: 'none', color: 'var(--emerald-400)', fontWeight: 600, cursor: 'pointer' }}
              >
                Create Account
              </button>
              <span style={{ color: 'var(--text-dim)' }}>•</span>
              <button
                type="button"
                onClick={() => { clearErrors(); setAuthMode('forgot'); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Presentation 1-Click Demo */}
            <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={loginDemo}
                disabled={loading}
                className="btn btn-secondary btn-sm"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderColor: 'rgba(16, 185, 129, 0.25)',
                  color: 'var(--emerald-300)',
                  fontSize: '0.82rem'
                }}
              >
                <Sparkles size={14} color="var(--emerald-400)" />
                <span>1-Click Presentation Demo Mode</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: PHONE NUMBER ENTRY (Option 1) */}
        {authMode === 'phone' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <button
                type="button"
                onClick={() => { clearErrors(); setAuthMode('home'); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={16} />
                <span style={{ fontSize: '0.84rem' }}>Back</span>
              </button>
            </div>

            <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>
              📱 Continue with Phone
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '-8px' }}>
              Enter your mobile number. We will send an SMS OTP to verify your account.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                Mobile Number
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  style={{
                    background: 'rgba(5, 14, 10, 0.85)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 10px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <input
                  type="tel"
                  required
                  autoFocus
                  placeholder="e.g. 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(5, 14, 10, 0.85)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    color: '#fff',
                    fontSize: '0.98rem',
                    outline: 'none',
                    letterSpacing: '0.04em'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !phoneNumber.trim()}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '1rem', marginTop: '6px' }}
            >
              <span>Send OTP</span>
              <ArrowRight size={17} />
            </button>
          </form>
        )}

        {/* VIEW 3: VERIFY OTP (Option 1b — PRD Section 2) */}
        {authMode === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <button
                type="button"
                onClick={() => { clearErrors(); setAuthMode('phone'); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={16} />
                <span style={{ fontSize: '0.84rem' }}>Change Number</span>
              </button>
              <span style={{ fontSize: '0.82rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
                {countryCode} {phoneNumber}
              </span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 800 }}>
                Verify Your Number
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                “Enter the OTP sent to your mobile number.”
              </p>
            </div>

            {/* 6-Digit OTP Box */}
            <div>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                style={{
                  width: '100%',
                  background: 'rgba(5, 14, 10, 0.95)',
                  border: '2px solid var(--emerald-500)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  color: '#fff',
                  fontSize: '1.6rem',
                  letterSpacing: '0.45em',
                  textAlign: 'center',
                  fontWeight: 800,
                  outline: 'none',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Demo tip: enter any 6 digits (e.g. 123456)
                </span>
                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={handleResendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: countdown > 0 ? 'var(--text-dim)' : 'var(--emerald-400)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: countdown > 0 ? 'default' : 'pointer'
                  }}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
            >
              <span>Verify</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* VIEW 4: EMAIL LOGIN (Option 2 — PRD Section 3) */}
        {authMode === 'email' && (
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <button
                type="button"
                onClick={() => { clearErrors(); setAuthMode('home'); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={16} />
                <span style={{ fontSize: '0.84rem' }}>Back</span>
              </button>
            </div>

            <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>
              ✉️ Continue with Email
            </h2>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                Email Address
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@farm.com"
                style={{
                  width: '100%',
                  background: 'rgba(5, 14, 10, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { clearErrors(); setAuthMode('forgot'); }}
                  style={{ background: 'none', border: 'none', color: 'var(--emerald-400)', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    background: 'rgba(5, 14, 10, 0.85)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 42px 12px 14px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none'
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
              style={{ width: '100%', padding: '13px', fontSize: '1rem', marginTop: '4px' }}
            >
              <span>Login</span>
              <ArrowRight size={17} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => { clearErrors(); setAuthMode('register'); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.84rem', cursor: 'pointer' }}
              >
                Don't have an account? <strong style={{ color: 'var(--emerald-400)' }}>Create Account</strong>
              </button>
            </div>
          </form>
        )}

        {/* VIEW 5: CREATE ACCOUNT (Email Registration) */}
        {authMode === 'register' && (
          <form onSubmit={handleEmailRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => { clearErrors(); setAuthMode('home'); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={16} />
                <span style={{ fontSize: '0.84rem' }}>Back</span>
              </button>
            </div>

            <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>
              Create Farmer Account
            </h2>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 600 }}>
                Email Address
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@farm.com"
                style={{
                  width: '100%',
                  background: 'rgba(5, 14, 10, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '11px 14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 600 }}>
                Create Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{
                  width: '100%',
                  background: 'rgba(5, 14, 10, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '11px 14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 600 }}>
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                style={{
                  width: '100%',
                  background: 'rgba(5, 14, 10, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '11px 14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '1rem', marginTop: '6px' }}
            >
              <span>Create Account</span>
              <ArrowRight size={17} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => { clearErrors(); setAuthMode('email'); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.84rem', cursor: 'pointer' }}
              >
                Already have an account? <strong style={{ color: 'var(--emerald-400)' }}>Login</strong>
              </button>
            </div>
          </form>
        )}

        {/* VIEW 6: FORGOT PASSWORD */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => { clearErrors(); setAuthMode('email'); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={16} />
                <span style={{ fontSize: '0.84rem' }}>Back to Login</span>
              </button>
            </div>

            <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>
              Reset Password
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '-6px' }}>
              Enter your registered email address and we'll send you instructions to reset your password.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                Email Address
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@farm.com"
                style={{
                  width: '100%',
                  background: 'rgba(5, 14, 10, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '0.98rem' }}
            >
              <span>Send Reset Instructions</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
