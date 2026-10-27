import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  ArrowLeft,
  Phone,
  Lock,
  User,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Tractor,
  Layers,
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { PillButton, PillTabs, Badge } from '../components/ui';

export default function AuthPage({ onLoginSuccess, onBack, initialMode = 'login' }) {
  const { login, register, switchDemoRole } = useAuth();
  const { t, lang } = useLanguage();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [role, setRole] = useState('farmer'); // 'farmer' | 'buyer'

  // Form Fields
  const [phone, setPhone] = useState('9822011223');
  const [password, setPassword] = useState('farmer123');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('Niphad');
  const [district, setDistrict] = useState('Nashik');
  const [farmSize, setFarmSize] = useState('5.0');
  const [primaryCrops, setPrimaryCrops] = useState('Tomato, Onion');
  const [businessName, setBusinessName] = useState('Kisan Trade Logistics');
  const [buyerType, setBuyerType] = useState('processor');
  const [dailyCapacity, setDailyCapacity] = useState('30');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDemoLogin = (targetRole) => {
    switchDemoRole(targetRole);
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!phone || phone.length < 10) {
          throw new Error('Please enter a valid 10-digit mobile number.');
        }
        if (!password || password.length < 4) {
          throw new Error('Please enter your password.');
        }
        await login(phone, password);
      } else {
        if (!name.trim()) {
          throw new Error('Please provide your full name.');
        }
        if (!phone || phone.length < 10) {
          throw new Error('Please provide a valid 10-digit mobile number.');
        }
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const payload = {
          name,
          phone,
          password,
          role,
          language: lang || 'mr',
          farmerProfile:
            role === 'farmer'
              ? {
                  village,
                  district,
                  state: 'Maharashtra',
                  farmSizeAcres: parseFloat(farmSize) || 0,
                }
              : undefined,
          buyerProfile:
            role === 'buyer'
              ? {
                  businessName,
                  type: buyerType,
                  district,
                  dailyIntakeCapacityMT: parseFloat(dailyCapacity) || 0,
                }
              : undefined,
        };

        await register(payload);
      }

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const authTabs = [
    { id: 'login', label: 'Sign In (लॉगिन)', icon: <LogIn size={15} /> },
    { id: 'register', label: 'Create Account (नवीन खाते)', icon: <UserPlus size={15} /> },
  ];

  return (
    <div
      style={{
        minHeight: '85vh',
        padding: '32px 16px 80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-canvas, #F4F5F2)',
      }}
    >
      {/* Back button */}
      <div style={{ width: '100%', maxWidth: '580px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-pill)',
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            color: 'var(--color-forest-black)',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '0.86rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-subtle)',
            transition: 'all var(--transition-fast)',
          }}
        >
          <ArrowLeft size={16} />
          <span>← Back to Platform Overview</span>
        </button>
      </div>

      {/* Main Auth Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid var(--color-border)',
          boxShadow: '0 12px 40px rgba(15, 42, 29, 0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Top Header Banner */}
        <div
          style={{
            padding: '28px 28px 20px',
            background: 'linear-gradient(135deg, #F0F4ED 0%, #FFFFFF 100%)',
            borderBottom: '1px solid var(--color-border)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--color-forest-black)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              margin: '0 auto 12px',
              boxShadow: '0 4px 14px rgba(15, 42, 29, 0.15)',
            }}
          >
            🌱
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--color-forest-black)',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}
          >
            {mode === 'login' ? 'Sign In to FasalRakshak AI' : 'Join FasalRakshak AI Platform'}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              color: 'var(--color-text-secondary)',
              maxWidth: '420px',
              margin: '0 auto',
            }}
          >
            Intelligent Distress Mitigation & Farm-to-Market Guaranteed Recovery
          </p>

          {/* Mode Switcher Tabs */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            <PillTabs
              tabs={authTabs}
              activeTab={mode}
              onChange={(tabId) => {
                setMode(tabId);
                setError('');
              }}
            />
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: '28px' }}>
          {/* Quick 1-Click Demo Profiles */}
          <div
            style={{
              marginBottom: '24px',
              padding: '16px',
              background: 'var(--color-bg-subtle, #F7F6F2)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--color-forest-black)',
                }}
              >
                <Sparkles size={14} color="var(--color-orange-accent)" />
                <span>Instant Evaluator Demo Access</span>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--color-green-success)',
                  background: 'var(--color-green-light)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                1-Click Sign In
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
              {/* Farmer Demo */}
              <button
                type="button"
                onClick={() => handleDemoLogin('farmer')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-green-light-border, #C4E2CF)',
                  background: '#FFFFFF',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '1rem' }}>👨‍🌾</span>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-forest-black)' }}>
                    Ramesh Patil
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                  Farmer • Niphad, Nashik
                </div>
              </button>

              {/* Buyer Demo */}
              <button
                type="button"
                onClick={() => handleDemoLogin('buyer')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  background: '#FFFFFF',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '1rem' }}>🏢</span>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-forest-black)' }}>
                    Sahyadri Foods
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                  Buyer • 40 MT Intake
                </div>
              </button>

              {/* Admin Demo */}
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  background: '#FFFFFF',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '1rem' }}>🛡️</span>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-forest-black)' }}>
                    Dilip Rao
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                  APMC Regulator
                </div>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '20px 0',
              color: 'var(--color-text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            <span>OR ENTER CUSTOM CREDENTIALS</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                fontSize: '0.85rem',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                {/* Role Switcher */}
                <div style={{ marginBottom: '18px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      color: 'var(--color-forest-black)',
                      marginBottom: '8px',
                    }}
                  >
                    Select Account Role
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setRole('farmer')}
                      style={{
                        padding: '12px',
                        borderRadius: '14px',
                        border: role === 'farmer' ? '2px solid var(--color-forest-black)' : '1px solid var(--color-border)',
                        background: role === 'farmer' ? '#F2F8F4' : '#FFFFFF',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: role === 'farmer' ? 'var(--color-forest-black)' : 'var(--color-bg-subtle)',
                          color: role === 'farmer' ? '#FFFFFF' : 'var(--color-forest-black)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '15px',
                        }}
                      >
                        🌾
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-forest-black)' }}>
                          Farmer
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                          शेतकरी उत्पादक
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      style={{
                        padding: '12px',
                        borderRadius: '14px',
                        border: role === 'buyer' ? '2px solid var(--color-forest-black)' : '1px solid var(--color-border)',
                        background: role === 'buyer' ? '#F2F8F4' : '#FFFFFF',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: role === 'buyer' ? 'var(--color-forest-black)' : 'var(--color-bg-subtle)',
                          color: role === 'buyer' ? '#FFFFFF' : 'var(--color-forest-black)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '15px',
                        }}
                      >
                        🏢
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-forest-black)' }}>
                          Commercial Buyer
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                          खरेदीदार / प्रक्रियादार
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      color: 'var(--color-forest-black)',
                      marginBottom: '6px',
                    }}
                  >
                    Full Name (पूर्ण नाव)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-muted)',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Patil / सह्याद्री ऍग्रो"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
                        borderRadius: '12px',
                        border: '1.5px solid var(--color-border)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.92rem',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: 'var(--color-forest-black)',
                      }}
                    />
                  </div>
                </div>

                {/* Role Specific Details */}
                {role === 'farmer' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: 'var(--color-forest-black)',
                          marginBottom: '6px',
                        }}
                      >
                        Village / Taluka (गाव/तालुका)
                      </label>
                      <input
                        type="text"
                        placeholder="Niphad"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--color-border)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.88rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: 'var(--color-forest-black)',
                          marginBottom: '6px',
                        }}
                      >
                        Holding Acreage (जमीन एकर)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="5.0"
                        value={farmSize}
                        onChange={(e) => setFarmSize(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--color-border)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.88rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: 'var(--color-forest-black)',
                          marginBottom: '6px',
                        }}
                      >
                        Business Entity Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sahyadri Mega Agro"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--color-border)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.88rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: 'var(--color-forest-black)',
                          marginBottom: '6px',
                        }}
                      >
                        Daily Capacity (Metric Tons)
                      </label>
                      <input
                        type="number"
                        placeholder="30"
                        value={dailyCapacity}
                        onChange={(e) => setDailyCapacity(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--color-border)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.88rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Mobile Number */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  color: 'var(--color-forest-black)',
                  marginBottom: '6px',
                }}
              >
                10-Digit Mobile Number (मोबाईल नंबर)
              </label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }}
                />
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9822011223"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--color-border)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.92rem',
                    outline: 'none',
                    background: '#FFFFFF',
                    color: 'var(--color-forest-black)',
                    letterSpacing: '0.04em',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  color: 'var(--color-forest-black)',
                  marginBottom: '6px',
                }}
              >
                Password (पासवर्ड)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--color-border)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.92rem',
                    outline: 'none',
                    background: '#FFFFFF',
                    color: 'var(--color-forest-black)',
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-forest-black)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.96rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(15, 42, 29, 0.25)',
                transition: 'all var(--transition-fast)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span>Authenticating with Node.js Server...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In to Portal</span>
                  <span>→</span>
                </>
              ) : (
                <>
                  <span>Create {role === 'farmer' ? 'Farmer' : 'Buyer'} Account</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div style={{ textAlign: 'center', marginTop: '22px' }}>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.86rem',
                color: 'var(--color-forest-black)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {mode === 'login'
                ? "Don't have an account yet? Register here (नवीन खाते नोंदणी करा)"
                : 'Already have an account? Sign in here (लॉगिन करा)'}
            </button>
          </div>
        </div>
      </div>

      {/* Trust & Security Badge footer */}
      <div
        style={{
          marginTop: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--color-text-secondary)',
          fontSize: '0.78rem',
        }}
      >
        <ShieldCheck size={16} color="var(--color-green-success)" />
        <span>Secured by JWT Token Authentication • APMC Accredited Network</span>
      </div>
    </div>
  );
}
