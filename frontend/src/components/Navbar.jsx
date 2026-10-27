import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Sparkles, LogIn, LogOut, Globe, CheckCircle2, User } from 'lucide-react';

export default function Navbar({ onOpenAiModal }) {
  const { user, role, switchDemoRole, logout, setIsAuthModalOpen } = useAuth();
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="glass-nav">
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--green-800), var(--green-600))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(26, 107, 58, 0.3)',
              color: '#fff',
              fontSize: 22,
            }}
          >
            🌱
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.28rem',
                  color: 'var(--green-900)',
                  letterSpacing: '-0.02em',
                }}
              >
                FasalRakshak AI
              </span>
              <span
                style={{
                  fontFamily: 'Noto Sans Devanagari',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--green-700)',
                  background: 'var(--green-100)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                फसल रक्षक
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {t('brandTagline')}
            </div>
          </div>
        </div>

        {/* Center: 1-Click Role Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <button
            onClick={() => switchDemoRole('farmer')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: role === 'farmer' ? 'var(--green-800)' : 'transparent',
              color: role === 'farmer' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: role === 'farmer' ? '0 2px 8px rgba(26, 107, 58, 0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            👨‍🌾 {t('farmerRole')}
          </button>
          <button
            onClick={() => switchDemoRole('buyer')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: role === 'buyer' ? 'var(--green-800)' : 'transparent',
              color: role === 'buyer' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: role === 'buyer' ? '0 2px 8px rgba(26, 107, 58, 0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            🏢 {t('buyerRole')}
          </button>
          <button
            onClick={() => switchDemoRole('admin')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: role === 'admin' ? 'var(--green-800)' : 'transparent',
              color: role === 'admin' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: role === 'admin' ? '0 2px 8px rgba(26, 107, 58, 0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            🛡️ {t('adminRole')}
          </button>
        </div>

        {/* Right Controls: AI Assistant, Language Switcher, Profile/Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* AI Copilot Button */}
          <button
            onClick={onOpenAiModal}
            className="btn btn-secondary"
            style={{
              padding: '8px 14px',
              fontSize: '0.875rem',
              boxShadow: '0 2px 10px rgba(46, 143, 82, 0.15)',
              position: 'relative',
            }}
          >
            <Sparkles size={16} color="var(--green-700)" />
            <span>{t('askAi')}</span>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--green-500)',
                display: 'inline-block',
              }}
            />
          </button>

          {/* Language Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#ffffff',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '3px',
            }}
          >
            <button
              onClick={() => setLang('mr')}
              style={{
                padding: '4px 8px',
                fontSize: '0.8rem',
                fontWeight: lang === 'mr' ? 700 : 500,
                color: lang === 'mr' ? 'var(--green-800)' : 'var(--text-muted)',
                background: lang === 'mr' ? 'var(--green-100)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              मराठी
            </button>
            <button
              onClick={() => setLang('hi')}
              style={{
                padding: '4px 8px',
                fontSize: '0.8rem',
                fontWeight: lang === 'hi' ? 700 : 500,
                color: lang === 'hi' ? 'var(--green-800)' : 'var(--text-muted)',
                background: lang === 'hi' ? 'var(--green-100)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLang('en')}
              style={{
                padding: '4px 8px',
                fontSize: '0.8rem',
                fontWeight: lang === 'en' ? 700 : 500,
                color: lang === 'en' ? 'var(--green-800)' : 'var(--text-muted)',
                background: lang === 'en' ? 'var(--green-100)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              EN
            </button>
          </div>

          {/* User & Auth */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--green-100)',
                    color: 'var(--green-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  <User size={15} />
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {user.phone}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                title={t('logout')}
                style={{
                  padding: 8,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-light)',
                  background: '#fff',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
            >
              <LogIn size={16} />
              <span>{t('login')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
