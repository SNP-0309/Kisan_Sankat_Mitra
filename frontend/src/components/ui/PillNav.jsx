import React, { useState } from 'react';
import { Sparkles, LogIn, LogOut, User, Menu, X, Globe } from 'lucide-react';
import PillButton from './PillButton';
import { INDIAN_LANGUAGES } from '../../context/LanguageContext';

/**
 * PillNav Component
 * Floating pill navbar inspired by the reference design.
 * Features:
 * - Brand logo left (click navigates to home/overview)
 * - Centered floating pill with per-role links
 * - Mobile responsive: on screens <= 860px, desktop center links collapse to a sleek floating bottom pill bar
 * - Right actions: Language switcher, Kisan AI Copilot pill, and User status / Sign In
 */
export default function PillNav({
  brandTitle = 'FasalRakshak AI',
  brandDevanagari = 'फसल रक्षक',
  links = [],
  activeLinkId,
  onSelectLink,
  lang = 'en',
  onSelectLang,
  onOpenAiModal,
  user = null,
  role = null,
  onOpenAuth,
  onLogout,
  onBrandClick,
  style = {},
}) {
  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: '12px',
          zIndex: 50,
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 12px',
          ...style,
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-floating-nav)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          {/* Brand Left */}
          <div
            onClick={onBrandClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: onBrandClick ? 'pointer' : 'default',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--color-forest-black)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              🌱
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                    color: 'var(--color-forest-black)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {brandTitle}
                </span>
                <span
                  className="hide-mobile-xs"
                  style={{
                    fontFamily: 'Noto Sans Devanagari',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--color-green-success)',
                    background: 'var(--color-green-light)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                  }}
                >
                  {brandDevanagari}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Centered Floating Pill Links (Hidden on <= 860px) */}
          {links && links.length > 0 && (
            <nav
              className="desktop-nav-links"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--color-bg-subtle)',
                padding: '3px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-border)',
                gap: '2px',
              }}
            >
              {links.map((link) => {
                const isActive = activeLinkId === link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => onSelectLink && onSelectLink(link.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-pill)',
                      border: isActive ? '1px solid var(--color-border-dark)' : '1px solid transparent',
                      backgroundColor: isActive ? 'var(--color-forest-black)' : 'transparent',
                      color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {link.icon && <span>{link.icon}</span>}
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Actions: AI Copilot, Language, Sign In / Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {/* AI Copilot Button */}
            {onOpenAiModal && (
              <button
                type="button"
                onClick={onOpenAiModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-forest-black)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <Sparkles size={14} color="var(--color-green-success)" />
                <span className="hide-mobile-xs">AI Copilot</span>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--color-orange-accent)',
                  }}
                />
              </button>
            )}

            {/* Multi-language Selector (All 13 Indian Languages) */}
            {onSelectLang && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '4px 8px',
                  gap: '5px',
                }}
              >
                <Globe size={13} color="var(--color-forest-medium)" />
                <select
                  value={lang}
                  onChange={(e) => onSelectLang(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    color: 'var(--color-forest-black)',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  title="Select Indian Regional Language"
                >
                  {INDIAN_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native} ({l.code.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* User Profile or Sign In */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    background: 'var(--color-bg-subtle)',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-forest-black)',
                  }}
                >
                  <User size={13} />
                  <span className="hide-mobile-xs">{user.name?.split(' ')[0] || 'User'}</span>
                  {role && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'var(--color-forest-black)',
                        color: '#FFFFFF',
                        textTransform: 'capitalize',
                      }}
                    >
                      {role}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  style={{
                    padding: '6px',
                    borderRadius: '50%',
                    border: '1px solid var(--color-border)',
                    background: '#FFFFFF',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Log Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <PillButton variant="dark" size="sm" onClick={onOpenAuth} showArrow>
                Sign In
              </PillButton>
            )}
          </div>
        </div>
      </header>

      {/* Floating Bottom Pill Bar for Mobile (Screens <= 860px) */}
      {links && links.length > 0 && (
        <div
          className="mobile-bottom-bar"
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            width: 'calc(100% - 24px)',
            maxWidth: '480px',
            background: 'rgba(15, 42, 29, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 8px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          {links.map((link) => {
            const isActive = activeLinkId === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onSelectLink && onSelectLink(link.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? 'var(--color-forest-black)' : 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.icon && <span>{link.icon}</span>}
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
