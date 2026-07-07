import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  ReferenceLine
} from 'recharts';
import { Sparkles } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
        <p className="text-xs text-slate-400 font-semibold">{data.date}</p>
        <div className="flex items-center space-x-4 mt-2">
          <div>
            <p className="text-xxs text-slate-500 font-medium uppercase">Close Price</p>
            <p className="text-sm font-bold text-slate-200">
              ${data.close.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          {data.volume && (
            <div>
              <p className="text-xxs text-slate-500 font-medium uppercase">Volume</p>
              <p className="text-sm font-semibold text-indigo-400">
                {data.volume.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const StockChart = ({ data = [], symbol, timeframe, setTimeframe, changePercent = 0 }) => {
  const isPositive = changePercent >= 0;

  // Colors based on price action
  const strokeColor = isPositive ? '#10b981' : '#f43f5e'; // emerald vs rose
  const gradientId = `colorPrice_${symbol || 'default'}`;

  // Find min/max values to fit the chart nicely
  const closePrices = data.map(d => d.close);
  const minPrice = Math.min(...closePrices) * 0.98;
  const maxPrice = Math.max(...closePrices) * 1.02;

  const timeframes = [
    { label: '1W', value: '7' },
    { label: '1M', value: '30' },
    { label: '6M', value: '180' },
    { label: '1Y', value: '365' }
  ];

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-900/30 rounded-3xl border border-slate-800/40">
        <div className="text-center text-slate-500">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-spin" />
          <p className="text-sm font-medium">Preparing historical chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Timeframe Selectors Header */}
      {timeframe && setTimeframe && (
        <div className="flex items-center justify-end space-x-1.5 mb-6">
          {timeframes.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                timeframe === tf.value
                  ? 'bg-slate-800 text-slate-100 border border-slate-700/80 shadow-md shadow-slate-900/50'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      )}

      {/* Chart Canvas */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.00}/>
              </linearGradient>
            </defs>

            <XAxis 
              dataKey="date" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              dy={10}
              tickFormatter={(dateStr) => {
                try {
                  const d = new Date(dateStr);
                  // Format based on timeframe scope
                  if (data.length <= 7) {
                    return d.toLocaleDateString(undefined, { weekday: 'short' });
                  }
                  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                } catch {
                  return dateStr;
                }
              }}
            />
            
            <YAxis 
              domain={[minPrice, maxPrice]} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              dx={-5}
              orientation="right"
              tickFormatter={(val) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '3 3' }} />

            <Area 
              type="monotone" 
              dataKey="close" 
              stroke={strokeColor} 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;
