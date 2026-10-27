import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * PillButton
 * Variants:
 * - 'dark' (Default): Near-black forest green background (#0F2A1D) with white text & arrow icon
 * - 'outline': White/transparent background with 1px border (#E6E8E3), hover to #0F2A1D
 * - 'orange': Vibrant accent pill (#FF5A1F) with white text
 * - 'ghost': Clean borderless text button
 */
export default function PillButton({
  children,
  variant = 'dark',
  size = 'md',
  icon = null,
  showArrow = false,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  style = {},
  ...props
}) {
  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '0.84rem' },
    md: { padding: '12px 24px', fontSize: '0.92rem' },
    lg: { padding: '15px 32px', fontSize: '1.02rem' },
  };

  const variantStyles = {
    dark: {
      backgroundColor: 'var(--color-forest-black)',
      color: '#FFFFFF',
      border: '1px solid transparent',
      boxShadow: '0 4px 16px rgba(15, 42, 29, 0.18)',
    },
    outline: {
      backgroundColor: '#FFFFFF',
      color: 'var(--color-forest-black)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-subtle)',
    },
    orange: {
      backgroundColor: 'var(--color-orange-accent)',
      color: '#FFFFFF',
      border: '1px solid transparent',
      boxShadow: '0 4px 14px rgba(255, 90, 31, 0.28)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-forest-black)',
      border: '1px solid transparent',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`pill-btn ${className}`}
      style={{
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all var(--transition-fast)',
        letterSpacing: '-0.01em',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
      {showArrow && <ArrowRight size={16} strokeWidth={2.2} />}
    </button>
  );
}
