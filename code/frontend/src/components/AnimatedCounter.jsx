import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const formatValue = (value, decimals, prefix, suffix) => {
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return `${prefix}${formatted}${suffix}`;
};

// Smoothly tweens a numeric display between values, e.g. balances that update after a trade.
const AnimatedCounter = ({ value = 0, decimals = 2, prefix = '', suffix = '', className = '' }) => {
  const numericValue = Number.isFinite(value) ? value : 0;
  const spring = useSpring(numericValue, { stiffness: 120, damping: 20, mass: 0.6 });
  const [display, setDisplay] = useState(() => formatValue(numericValue, decimals, prefix, suffix));
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      spring.jump(numericValue);
      setDisplay(formatValue(numericValue, decimals, prefix, suffix));
      return;
    }
    spring.set(numericValue);
  }, [numericValue]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplay(formatValue(latest, decimals, prefix, suffix));
    });
    return unsubscribe;
  }, [spring, decimals, prefix, suffix]);

  return (
    <motion.span className={`tabular-nums ${className}`}>
      {display}
    </motion.span>
  );
};

export default AnimatedCounter;
