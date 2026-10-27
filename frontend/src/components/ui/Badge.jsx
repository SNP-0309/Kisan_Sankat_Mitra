import React from 'react';

/**
 * Badge Component
 * Variants:
 * - 'neutral': light grey/white background with thin border
 * - 'orange': vibrant orange accent (#FF5A1F) with white text or pill
 * - 'success': calm green (#2E7D32)
 * - 'warning': amber warning
 * - 'distress': red alert
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon = null,
  style = {},
}) {
  const variantStyles = {
    neutral: {
      background: 'var(--color-bg-subtle)',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border)',
    },
    orange: {
      background: 'var(--color-orange-accent)',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)',
    },
    orangeSoft: {
      background: 'var(--color-orange-soft)',
      color: 'var(--color-orange-accent)',
      border: '1px solid rgba(255, 90, 31, 0.2)',
    },
    success: {
      background: 'var(--color-green-light)',
      color: 'var(--color-green-success)',
      border: '1px solid rgba(46, 125, 50, 0.2)',
    },
    warning: {
      background: 'var(--color-amber-soft)',
      color: 'var(--color-amber-warning)',
      border: '1px solid rgba(217, 119, 6, 0.25)',
    },
    distress: {
      background: 'var(--color-red-soft)',
      color: 'var(--color-red-distress)',
      border: '1px solid rgba(220, 38, 38, 0.25)',
    },
  };

  const sizeStyles = {
    sm: { padding: '3px 8px', fontSize: '0.72rem' },
    md: { padding: '5px 12px', fontSize: '0.8rem' },
    counter: { width: '28px', height: '28px', padding: 0, fontSize: '0.75rem', borderRadius: '50%' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        letterSpacing: '0.01em',
        lineHeight: 1,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
          }}
        />
      )}
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
