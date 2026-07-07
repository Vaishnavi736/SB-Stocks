import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Star, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Plus, 
  Search,
  Sparkles
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import GlassCard from '../components/GlassCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

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
            <h1 className="text-3xl font-extrabold text-slate-100 font-display">Watchlist</h1>
            <p className="text-xs text-slate-400 mt-1">Bookmarked tickers and daily performance indicators.</p>
          </div>
          <Link 
            to="/market"
            className="inline-flex items-center space-x-1 px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/10 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stock</span>
          </Link>
        </div>

        {/* Watchlist View */}
        {loading ? (
          <LoadingSkeleton.Table rows={5} cols={5} />
        ) : watchlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((item) => {
              const isPositive = item.changePercent >= 0;
              return (
                <Link 
                  key={item.stockSymbol}
                  to={`/stocks/${item.stockSymbol}`}
                  className="block group"
                >
                  <GlassCard className="relative overflow-hidden border-slate-800/80 glass-card-hover p-6" hover={true}>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xl font-extrabold text-slate-100 font-display tracking-tight group-hover:text-indigo-400 transition-colors">
                          {item.stockSymbol}
                        </span>
                        <p className="text-xxs text-slate-500 font-medium truncate max-w-40 mt-0.5">{item.companyName}</p>
                      </div>
                      
                      {/* Delete Action Star */}
                      <button
                        onClick={(e) => handleRemove(item.stockSymbol, e)}
                        className="p-2 border border-slate-850 bg-slate-950/40 text-amber-400 rounded-xl hover:bg-rose-950 hover:border-rose-900/30 hover:text-rose-400 transition-all"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Cost Indicators */}
                    <div className="flex justify-between items-end mt-8">
                      <div>
                        <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 block">Quote Price</span>
                        <span className="text-2xl font-bold font-display text-slate-100 mt-1 leading-none">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                          isPositive 
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' 
                            : 'bg-rose-950/40 text-rose-400 border border-rose-500/10'
                        }`}>
                          {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Sparkline glow decor */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
                      isPositive ? 'from-emerald-500 to-teal-500' : 'from-rose-500 to-red-500'
                    } opacity-30`}></div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        ) : (
          <GlassCard className="text-center py-20" hover={false}>
            <Star className="w-12 h-12 mx-auto text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-300 font-display">Watchlist is Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">Bookmarked stocks will be displayed here alongside their live quotes. Search the Market directory to start saving stocks.</p>
            <Link to="/market" className="inline-flex items-center space-x-1 px-5 py-3 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-2xl shadow-lg mt-6 transition-all">
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
