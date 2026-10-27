import React from 'react';

/**
 * SectionHeading Component
 * Displays editorial geometric headlines with optional pill tag and sparkle accent.
 */
export default function SectionHeading({
  tag = '',
  title,
  subtitle = '',
  centered = false,
  sparkle = false,
  style = {},
}) {
  return (
    <div
      style={{
        textAlign: centered ? 'center' : 'left',
        marginBottom: '28px',
        position: 'relative',
        ...style,
      }}
    >
      {/* Small Category Pill Tag */}
      {tag && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            fontSize: '0.78rem',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--color-forest-medium)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '12px',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-green-success)' }} />
          <span>{tag}</span>
        </div>
      )}

      {/* Main Headline */}
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 4vw, 3rem)',
          fontWeight: 800,
          color: 'var(--color-forest-black)',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          maxWidth: centered ? '850px' : '720px',
          margin: centered ? '0 auto' : '0',
          position: 'relative',
        }}
      >
        {title}
        {sparkle && (
          <span
            style={{
              display: 'inline-block',
              marginLeft: '8px',
              color: 'var(--color-orange-accent)',
              fontSize: '0.85em',
            }}
          >
            ✦
          </span>
        )}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.95rem, 1.5vw, 1.12rem)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            marginTop: '12px',
            maxWidth: centered ? '640px' : '560px',
            margin: centered ? '12px auto 0' : '12px 0 0',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
