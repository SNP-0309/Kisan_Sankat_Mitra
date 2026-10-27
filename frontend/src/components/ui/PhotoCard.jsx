import React from 'react';

/**
 * PhotoCard Component
 * Displays rounded photographic tiles with titles and captions matching the reference aesthetic.
 */
export default function PhotoCard({
  imageSrc,
  imageAlt = '',
  title,
  description = '',
  badge = null,
  stepNumber = null,
  onClick,
  style = {},
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {/* Photo Image Wrapper */}
      <div
        style={{
          width: '100%',
          height: '220px',
          borderRadius: 'calc(var(--radius-card) - 6px)',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: 'var(--color-bg-subtle)',
        }}
      >
        <img
          src={imageSrc}
          alt={imageAlt || title}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onError={(e) => {
            // Graceful fallback gradient if local image path is not yet present
            e.target.style.display = 'none';
            e.target.parentElement.style.background =
              'linear-gradient(135deg, var(--color-bg-subtle) 0%, var(--color-border) 100%)';
          }}
        />

        {/* Floating Top Badge */}
        {badge && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: 2,
            }}
          >
            {badge}
          </div>
        )}

        {/* Step Counter Indicator */}
        {stepNumber && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(15, 42, 29, 0.75)',
              backdropFilter: 'blur(8px)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.8rem',
            }}
          >
            {stepNumber}
          </div>
        )}
      </div>

      {/* Title & Caption */}
      <div style={{ padding: '16px 8px 8px' }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--color-forest-black)',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              color: 'var(--color-text-secondary)',
              marginTop: '6px',
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
