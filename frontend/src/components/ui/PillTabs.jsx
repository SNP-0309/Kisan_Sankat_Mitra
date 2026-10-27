import React from 'react';

/**
 * PillTabs Component
 * Horizontal floating pill switcher with near-black forest green active state.
 */
export default function PillTabs({
  tabs = [],
  activeTab,
  onChange,
  style = {},
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px',
        backgroundColor: 'var(--color-bg-subtle)',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--color-border)',
        gap: '4px',
        overflowX: 'auto',
        maxWidth: '100%',
        ...style,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              border: isActive ? '1px solid var(--color-border-dark)' : '1px solid transparent',
              backgroundColor: isActive ? 'var(--color-forest-black)' : 'transparent',
              color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.86rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
              boxShadow: isActive ? '0 2px 10px rgba(15, 42, 29, 0.2)' : 'none',
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--color-border)',
                  color: isActive ? '#FFFFFF' : 'var(--color-forest-black)',
                  fontWeight: 700,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
