import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = true, onClick }) => {
  const Component = onClick ? 'button' : 'div';
  
  const baseClass = `glass-panel rounded-3xl p-6 text-left ${
    hover ? 'glass-card-hover' : ''
  } ${onClick ? 'cursor-pointer w-full focus:outline-none focus:ring-1 focus:ring-indigo-500' : ''} ${className}`;

  if (onClick) {
    return (
      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className={baseClass}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <div className={baseClass}>
      {children}
    </div>
  );
};

export default GlassCard;
