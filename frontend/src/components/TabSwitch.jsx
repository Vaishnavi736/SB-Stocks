import React from 'react';
import { motion } from 'framer-motion';

// Segmented control with a shared-layout sliding pill behind the active tab.
// layoutId must be unique per on-screen instance so unrelated tab groups don't cross-animate.
const TabSwitch = ({ tabs, active, onChange, layoutId, className = '' }) => (
  <div className={`flex bg-surface-sunken border border-border-subtle p-1.5 rounded-2xl text-xs font-bold text-text-muted ${className}`}>
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = active === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl transition-colors ${
            isActive ? 'text-text-primary' : 'hover:text-text-primary'
          }`}
        >
          {isActive && (
            <motion.span
              layoutId={layoutId}
              className="rgb-ring absolute inset-0 bg-surface-raised border border-border-default rounded-xl shadow-elevation-1"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {tab.label}
          </span>
        </button>
      );
    })}
  </div>
);

export default TabSwitch;
