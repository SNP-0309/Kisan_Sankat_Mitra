import React from 'react';

/**
 * Skeleton Loader Component
 * Smooth pulsing shimmer placeholder while API requests are pending.
 */
export default function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  style = {},
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--color-bg-subtle)',
        backgroundImage: 'linear-gradient(90deg, #ECEEEA 0px, #F7F8F6 50%, #ECEEEA 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
        ...style,
      }}
    />
  );
}
