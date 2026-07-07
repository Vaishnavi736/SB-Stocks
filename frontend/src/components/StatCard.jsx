import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

const StatCard = ({ 
  title, 
  value, 
  change, 
  changePercent, 
  isPercentPositive = true,
  icon: Icon,
  description,
  glow = false
}) => {
  const isPositive = changePercent !== undefined ? changePercent >= 0 : isPercentPositive;
  const showTrend = changePercent !== undefined || change !== undefined;
  
  let glowClass = '';
  if (glow) {
    glowClass = isPositive ? 'glow-emerald' : 'glow-rose';
  }

  return (
    <GlassCard className={`relative overflow-hidden ${glowClass}`} hover={true}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-display mt-2 leading-none">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl ${
            showTrend 
              ? isPositive 
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/25' 
                : 'bg-rose-950/40 text-rose-400 border border-rose-500/25'
              : 'bg-slate-800 text-slate-300 border border-slate-700/50'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {showTrend ? (
          <div className="flex items-center space-x-1.5">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
            <span className={`text-sm font-bold ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isPositive ? '+' : ''}{changePercent !== undefined ? `${changePercent}%` : change}
            </span>
            {change !== undefined && changePercent !== undefined && (
              <span className="text-xs text-slate-500 font-medium">
                (${Math.abs(change).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-medium">{description || 'Total virtual value'}</div>
        )}
      </div>
    </GlassCard>
  );
};

export default StatCard;
