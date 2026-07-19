import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = true, onClick }) => {
  const baseClass = `card rounded-3xl p-6 text-left ${
    hover ? 'card-interactive rgb-glow rgb-glow-card' : ''
  } ${onClick ? 'cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-brand-500/50' : ''} ${className}`;

  if (onClick) {
    return (
      <motion.button whileTap={{ scale: 0.99 }} onClick={onClick} className={baseClass}>
        {children}
      </motion.button>
    );
  }

  return <div className={baseClass}>{children}</div>;
};

export default GlassCard;
