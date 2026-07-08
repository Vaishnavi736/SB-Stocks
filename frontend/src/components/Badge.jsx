import React from 'react';

const toneClasses = {
  success: 'bg-success-500/10 text-success-500 border-success-500/25',
  danger: 'bg-danger-500/10 text-danger-500 border-danger-500/25',
  neutral: 'bg-surface-sunken text-text-secondary border-border-subtle',
  brand: 'bg-brand-500/10 text-brand-500 border-brand-500/25',
};

const Badge = ({ tone = 'neutral', className = '', children }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${toneClasses[tone]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
