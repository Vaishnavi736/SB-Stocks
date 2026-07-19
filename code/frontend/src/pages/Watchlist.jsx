import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Star,
  Trash2,
  Plus,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layout/DashboardLayout';
import GlassCard from '../components/GlassCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Badge from '../components/Badge';

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] } })
};

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get('/api/watchlist');
      if (response.data && response.data.success) {
        setWatchlist(response.data.watchlist);
      }
    } catch (error) {
      console.error('Failed to load watchlist:', error.message);
      toast.error('Could not load watchlist details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (symbol, e) => {
    e.preventDefault(); // Prevent navigating to stock
    e.stopPropagation();

    try {
      const response = await axios.delete(`/api/watchlist/${symbol}`);
      if (response.data && response.data.success) {
        setWatchlist(prev => prev.filter(item => item.stockSymbol !== symbol));
        toast.success(`${symbol} removed from watchlist`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove stock');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary font-display">Watchlist</h1>
            <p className="text-xs text-text-secondary mt-1">Bookmarked tickers and daily performance indicators.</p>
          </div>
          <Link
            to="/market"
            className="rgb-glow inline-flex items-center space-x-1 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/10 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stock</span>
          </Link>
        </div>

        {/* Watchlist View */}
        {loading ? (
          <LoadingSkeleton.Table rows={5} cols={5} />
        ) : watchlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {watchlist.map((item, idx) => {
              const isPositive = item.changePercent >= 0;
              return (
                <motion.div key={item.stockSymbol} custom={idx} initial="hidden" animate="show" variants={cardVariants} className="h-full">
                <Link
                  to={`/stocks/${item.stockSymbol}`}
                  className="block group h-full"
                >
                  <GlassCard className={`h-full relative overflow-hidden border-border-subtle p-6 border-l-2 ${isPositive ? 'border-l-success-500' : 'border-l-danger-500'}`} hover={true}>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xl font-extrabold text-text-primary font-display tracking-tight group-hover:text-brand-500 transition-colors">
                          {item.stockSymbol}
                        </span>
                        <p className="text-xxs text-text-muted font-medium truncate max-w-40 mt-0.5">{item.companyName}</p>
                      </div>

                      {/* Delete Action Star */}
                      <button
                        onClick={(e) => handleRemove(item.stockSymbol, e)}
                        className="p-2 border border-border-subtle bg-surface-sunken text-amber-400 rounded-xl hover:bg-danger-500/10 hover:border-danger-500/25 hover:text-danger-500 transition-all"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Cost Indicators */}
                    <div className="flex justify-between items-end mt-8">
                      <div>
                        <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted block">Quote Price</span>
                        <span className="text-2xl font-bold font-display text-text-primary mt-1 leading-none">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <Badge tone={isPositive ? 'success' : 'danger'}>
                          {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <GlassCard className="text-center py-20" hover={false}>
            <Star className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-bold text-text-primary font-display">Watchlist is Empty</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mt-2 leading-relaxed">Bookmarked stocks will be displayed here alongside their live quotes. Search the Market directory to start saving stocks.</p>
            <Link to="/market" className="rgb-glow inline-flex items-center space-x-1 px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-2xl shadow-lg mt-6 transition-all">
              <Search className="w-3.5 h-3.5" />
              <span>Browse Market</span>
            </Link>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Watchlist;
