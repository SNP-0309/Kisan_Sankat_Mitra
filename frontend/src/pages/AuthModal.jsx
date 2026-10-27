import React, { useState } from 'react';
import { LogIn, X, User, Phone, Lock, Sparkles, Check } from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, switchDemoRole } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [phone, setPhone] = useState('9822011223');
  const [password, setPassword] = useState('farmer123');
  const [name, setName] = useState('');
  const [role, setRole] = useState('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(phone, password);
      } else {
        await register({ name, phone, password, role });
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      setError(err.message || 'Authentication error. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (roleKey) => {
    switchDemoRole(roleKey);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, var(--green-100), #ffffff)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--green-800)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogIn size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--green-900)' }}>
                {mode === 'login' ? 'Sign In to FasalRakshak AI' : 'Create New Account'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Secure access for farmers, buyers, and APMC regulators
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            style={{
              padding: 6,
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid var(--border-medium)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* 1-Click Demo Profiles */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
              ⚡ Quick 1-Click Demo Access
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleDemoSelect('farmer')}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--green-300)',
                  background: 'var(--green-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--green-900)' }}>
                    👨‍🌾 Ramesh Patil (Farmer)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Phone: 9822011223 • Niphad, Nashik
                  </div>
                </div>
                <span className="badge badge-success">Enter</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('buyer')}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    🏢 Sahyadri Agro (Commercial Buyer)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Phone: 9822099887 • 40 MT Daily Intake
                  </div>
                </div>
                <span className="badge badge-info">Enter</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('admin')}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    🛡️ APMC Market Regulator (Admin)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Phone: 9822000001 • Nashik APMC Directorate
                  </div>
                </div>
                <span className="badge badge-warning">Enter</span>
              </button>
            </div>
          </div>

          <div
            style={{
              textAlign: 'center',
              position: 'relative',
              margin: '16px 0',
            }}
          >
            <span
              style={{
                background: '#fff',
                padding: '0 12px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                position: 'relative',
                zIndex: 2,
              }}
            >
              Or enter custom credentials
            </span>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 1,
                background: 'var(--border-light)',
                zIndex: 1,
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--red-100)',
                color: 'var(--red-700)',
                fontSize: '0.85rem',
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="farmer">Farmer (शेतकरी)</option>
                    <option value="buyer">Commercial Buyer (खरेदीदार)</option>
                    <option value="admin">APMC Regulator (प्रशासक)</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Phone Number (10 Digits)</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', marginTop: 8 }}
            >
              {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{ fontSize: '0.84rem', color: 'var(--green-800)', fontWeight: 600 }}
            >
              {mode === 'login'
                ? "Don't have an account? Register here"
                : 'Already registered? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
