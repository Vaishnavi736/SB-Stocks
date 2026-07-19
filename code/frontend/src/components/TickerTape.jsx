import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, TrendingDown } from 'lucide-react';

// A continuously scrolling strip of live quotes, positioned beneath the navbar.
// Purely decorative/navigational — failures are swallowed so it never blocks the app shell.
const TickerTape = () => {
  const [stocks, setStocks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchTicker = async () => {
      try {
        const response = await axios.get('/api/stocks');
        if (!cancelled && response.data?.success) {
          const merged = [
            ...(response.data.trending || []),
            ...(response.data.gainers || []),
            ...(response.data.losers || [])
          ];
          const unique = Array.from(new Map(merged.map((s) => [s.symbol, s])).values());
          setStocks(unique.slice(0, 14));
        }
      } catch {
        // Silent — ticker is decorative, never surface an error toast for it
      }
    };

    fetchTicker();
    const interval = setInterval(fetchTicker, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (stocks.length === 0) return null;

  const renderItems = (keyPrefix) =>
    stocks.map((stock) => {
      const isPositive = stock.changePercent >= 0;
      return (
        <button
          key={`${keyPrefix}-${stock.symbol}`}
          onClick={() => navigate(`/stocks/${stock.symbol}`)}
          className="flex items-center gap-2 px-4 shrink-0 group"
        >
          <span className="text-xs font-extrabold text-text-primary group-hover:text-brand-500 transition-colors">
            {stock.symbol}
          </span>
          <span className="text-xs font-semibold text-text-secondary tabular-nums">
            ${stock.price.toFixed(2)}
          </span>
          <span className={`inline-flex items-center gap-0.5 text-xxs font-bold tabular-nums ${
            isPositive ? 'text-success-500' : 'text-danger-500'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </span>
          <span className="w-px h-3.5 bg-border-subtle ml-2" />
        </button>
      );
    });

  return (
    <div className="w-full h-9 bg-surface-raised border-b border-border-subtle overflow-hidden flex items-center">
      <div className="flex animate-marquee whitespace-nowrap">
        {renderItems('a')}
        {renderItems('b')}
      </div>
    </div>
  );
};

export default TickerTape;
