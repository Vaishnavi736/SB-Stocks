import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import GlassCard from './GlassCard';
import AnimatedCounter from './AnimatedCounter';

const StatCard = ({
  title,
  value,
  prefix = '',
  decimals = 2,
  change,
  changePercent,
  isPercentPositive = true,
  icon: Icon,
  description,
  glow = false
}) => {
  const isPositive = changePercent !== undefined ? changePercent >= 0 : isPercentPositive;
  const showTrend = changePercent !== undefined || change !== undefined;
  const isNumeric = typeof value === 'number';

  let accentClass = '';
  if (glow) {
    accentClass = isPositive ? 'border-l-2 border-l-success-500' : 'border-l-2 border-l-danger-500';
  }

  return (
    <GlassCard className={`relative overflow-hidden ${accentClass}`} hover={true}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-text-primary font-display mt-2 leading-none">
            {isNumeric ? <AnimatedCounter value={value} prefix={prefix} decimals={decimals} /> : value}
          </h3>
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl ${
            showTrend
              ? isPositive
                ? 'bg-success-500/10 text-success-500 border border-success-500/25'
                : 'bg-danger-500/10 text-danger-500 border border-danger-500/25'
              : 'bg-surface-sunken text-text-secondary border border-border-subtle'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {showTrend ? (
          <div className="flex items-center space-x-1.5">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-success-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-danger-500" />
            )}
            <span className={`text-sm font-bold tabular-nums ${
              isPositive ? 'text-success-500' : 'text-danger-500'
            }`}>
              {changePercent !== undefined ? (
                <>{isPositive ? '+' : ''}<AnimatedCounter value={changePercent} decimals={2} suffix="%" /></>
              ) : change}
            </span>
            {change !== undefined && changePercent !== undefined && (
              <span className="text-xs text-text-muted font-medium tabular-nums">
                (<AnimatedCounter value={Math.abs(change)} prefix="$" decimals={2} />)
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-text-secondary font-medium">{description || 'Total virtual value'}</div>
        )}
      </div>
    </GlassCard>
  );
};

export default StatCard;
