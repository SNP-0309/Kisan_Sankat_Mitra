import React from 'react';

/**
 * StatStrip Component
 * Renders high-impact numerical figures with small labels and 1px thin dividers.
 * Props:
 * - stats: Array<{ value: string|number, label: string, caption?: string }>
 */
export default function StatStrip({ stats = [], style = {} }) {
  if (!stats || stats.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        padding: '28px 36px',
        margin: '28px 0',
        ...style,
      }}
    >
      {stats.map((item, index) => (
        <React.Fragment key={index}>
          <div
            style={{
              flex: '1 1 180px',
              padding: '10px 16px',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                fontWeight: 800,
                color: 'var(--color-forest-black)',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              {item.value}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                marginTop: '6px',
              }}
            >
              {item.label}
            </div>
            {item.caption && (
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--color-text-muted)',
                  marginTop: '2px',
                }}
              >
                {item.caption}
              </div>
            )}
          </div>

          {/* Thin vertical divider between items (hidden on small screen wrap) */}
          {index < stats.length - 1 && (
            <div
              className="stat-divider"
              style={{
                width: '1px',
                height: '56px',
                backgroundColor: 'var(--color-border)',
                margin: '0 12px',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
