import React from 'react';
import { Link } from 'react-router-dom';

const SIZES = {
  sm: { box: 'w-8 h-8', radius: 'rounded-lg', text: 'text-base' },
  md: { box: 'w-9 h-9', radius: 'rounded-xl', text: 'text-xl' },
  lg: { box: 'w-10 h-10', radius: 'rounded-xl', text: 'text-2xl' }
};

// Ascending-bars mark: a small, literal "stock chart" glyph instead of a generic icon.
export const LogoMark = ({ size = 'md', ring = true, className = '' }) => {
  const { box, radius } = SIZES[size];
  return (
    <div className={`${ring ? 'rgb-ring' : ''} ${box} ${radius} bg-brand-600 flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 24 24" width="56%" height="56%" fill="none" aria-hidden="true">
        <rect x="3" y="13" width="4.2" height="8" rx="1.1" fill="white" fillOpacity="0.55" />
        <rect x="9.9" y="7.5" width="4.2" height="13.5" rx="1.1" fill="white" fillOpacity="0.8" />
        <rect x="16.8" y="3" width="4.2" height="18" rx="1.1" fill="white" />
      </svg>
    </div>
  );
};

const Logo = ({ size = 'md', to = '/', ring = true, showText = true, className = '' }) => {
  const { text } = SIZES[size];
  return (
    <Link to={to} className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} ring={ring} />
      {showText && (
        <span className={`${text} font-display tracking-tight leading-none`}>
          <span className="font-extrabold text-brand-600">SB</span>
          <span className="font-semibold text-text-primary"> Stocks</span>
        </span>
      )}
    </Link>
  );
};

export default Logo;
