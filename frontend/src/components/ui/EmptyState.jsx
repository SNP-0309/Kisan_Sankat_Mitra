import React from 'react';
import { PackageOpen } from 'lucide-react';
import PillButton from './PillButton';

/**
 * EmptyState Component
 * Displays honest, calm empty state with no mock or fabricated data.
 */
export default function EmptyState({
  icon = null,
  title = 'No records found',
  description = 'There are no active records in this view right now.',
  actionLabel = '',
  onAction = null,
  style = {},
}) {
  return (
    <div
      style={{
        padding: '56px 24px',
        textAlign: 'center',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-card)',
        border: '1px dashed var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--color-bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          marginBottom: '16px',
        }}
      >
        {icon || <PackageOpen size={28} strokeWidth={1.8} />}
      </div>

      <h4
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'var(--color-forest-black)',
          marginBottom: '6px',
        }}
      >
        {title}
      </h4>

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: 'var(--color-text-muted)',
          maxWidth: '440px',
          lineHeight: 1.5,
          marginBottom: actionLabel ? '20px' : '0',
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <PillButton variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </PillButton>
      )}
    </div>
  );
}
