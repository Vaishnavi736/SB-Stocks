import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Star, 
  Sparkles, 
  Globe, 
  DollarSign, 
  Calendar,
  Building,
  Scale
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import GlassCard from '../components/GlassCard';
import StockChart from '../components/StockChart';
import TradingPanel from '../components/TradingPanel';
import NewsFeed from '../components/NewsFeed';
import LoadingSkeleton from '../components/LoadingSkeleton';

const StockDetails = () => {
  const { symbol } = useParams();
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [timeframe, setTimeframe] = useState('30'); // '7', '30', '180', '365'
  const [ownedQty, setOwnedQty] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const uppercaseSymbol = symbol.toUpperCase();

      // Fetch stock details (quote, profile, news)
      const detailsResponse = await axios.get(`/api/stocks/${uppercaseSymbol}`);
      
      // Fetch portfolio to check if user owns shares
      const portfolioResponse = await axios.get('/api/portfolio');
      
      // Fetch watchlist to check if watchlisted
      const watchlistResponse = await axios.get('/api/watchlist');

      if (detailsResponse.data && detailsResponse.data.success) {
        setData(detailsResponse.data.data);
      }

      if (portfolioResponse.data && portfolioResponse.data.success) {
        const holdings = portfolioResponse.data.data.holdings;
        const currentHolding = holdings.find(h => h.stockSymbol === uppercaseSymbol);
        setOwnedQty(currentHolding ? currentHolding.quantity : 0);
      }

      if (watchlistResponse.data && watchlistResponse.data.success) {
        const watchlist = watchlistResponse.data.watchlist;
        const watchlisted = watchlist.some(item => item.stockSymbol === uppercaseSymbol);
        setInWatchlist(watchlisted);
      }
    } catch (error) {
      console.error('Failed to load stock details:', error.message);
      toast.error('Failed to retrieve stock statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockHistory = async () => {
    try {
      setChartLoading(true);
      const uppercaseSymbol = symbol.toUpperCase();
      
      // Map timeframe days to appropriate query parameters
      const historyResponse = await axios.get(`/api/stocks/${uppercaseSymbol}/history`, {
        params: { days: timeframe }
      });
      if (historyResponse.data && historyResponse.data.success) {
        setHistory(historyResponse.data.history);
      }
    } catch (error) {
      console.error('Failed to load chart history:', error.message);
    } finally {
      setChartLoading(false);
    }
  };

  // Initial loads
  useEffect(() => {
    fetchStockData();
  }, [symbol]);

  // History reload on timeframe switch
  useEffect(() => {
    fetchStockHistory();
  }, [symbol, timeframe]);

  // Watchlist Toggle
  const handleWatchlistToggle = async () => {
    const uppercaseSymbol = symbol.toUpperCase();
    try {
      if (inWatchlist) {
        const response = await axios.delete(`/api/watchlist/${uppercaseSymbol}`);
        if (response.data && response.data.success) {
          setInWatchlist(false);
          toast.success(`${uppercaseSymbol} removed from watchlist`);
        }
      } else {
        const response = await axios.post('/api/watchlist', {
          stockSymbol: uppercaseSymbol,
          companyName: data?.profile?.name || `${uppercaseSymbol} Corp`
        });
        if (response.data && response.data.success) {
          setInWatchlist(true);
          toast.success(`${uppercaseSymbol} added to watchlist`);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Watchlist updates failed');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="h-20 bg-slate-900 border border-slate-800 animate-pulse rounded-3xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <LoadingSkeleton.Card height="h-[360px]" />
              <LoadingSkeleton.Card height="h-[200px]" />
            </div>
            <div>
              <LoadingSkeleton.Card height="h-[400px]" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { quote, profile, news } = data || {};
  const isPositive = quote?.dp >= 0;

  const keyStats = [
    { label: 'Open', value: quote ? `$${quote.o.toFixed(2)}` : '-' },
    { label: 'High', value: quote ? `$${quote.h.toFixed(2)}` : '-' },
    { label: 'Low', value: quote ? `$${quote.l.toFixed(2)}` : '-' },
    { label: 'Prev Close', value: quote ? `$${quote.pc.toFixed(2)}` : '-' },
    { label: 'Volume', value: quote ? quote.v.toLocaleString() : '-' },
    { label: 'Market Cap', value: profile?.marketCapitalization ? `$${(profile.marketCapitalization / 1000).toFixed(2)}B` : '-' },
    { label: 'PE Ratio', value: profile?.peRatio ? profile.peRatio.toFixed(1) : '-' },
    { label: 'Div Yield', value: profile?.dividendYield ? `${profile.dividendYield.toFixed(2)}%` : '0.00%' },
    { label: '52 Wk High', value: profile?.fiftyTwoWeekHigh ? `$${profile.fiftyTwoWeekHigh.toFixed(2)}` : '-' },
    { label: '52 Wk Low', value: profile?.fiftyTwoWeekLow ? `$${profile.fiftyTwoWeekLow.toFixed(2)}` : '-' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Back Link & Ticker Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <Link 
              to="/market" 
              className="p-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-slate-100 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            {profile?.logo && (
              <img src={profile.logo} alt="Logo" className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 p-1" />
            )}

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-extrabold text-slate-100 font-display leading-none">{symbol.toUpperCase()}</h1>
                <button
                  onClick={handleWatchlistToggle}
                  className={`p-2 rounded-xl transition-all border ${
                    inWatchlist 
                      ? 'bg-amber-950/40 border-amber-500/25 text-amber-400' 
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-200'
                  }`}
                  title="Toggle Watchlist"
                >
                  <Star className={`w-4 h-4 ${inWatchlist ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-semibold">{profile?.name || 'Company Profile'}</p>
            </div>
          </div>

          {/* Pricing Info */}
          {quote && (
            <div className="text-left md:text-right">
              <span className="text-3xl font-extrabold font-display text-slate-100 leading-none">
                ${quote.c.toFixed(2)}
              </span>
              <div className="flex items-center md:justify-end space-x-2 mt-1">
                <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? '+' : ''}{quote.dp.toFixed(2)}%
                </span>
                <span className="text-xxs text-slate-500 font-medium">
                  ({isPositive ? '+' : ''}${quote.d.toFixed(2)} Today)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chart View and Buying Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Chart Column */}
          <div className="lg:col-span-2 space-y-8">
            <GlassCard className="flex flex-col justify-between" hover={false}>
              <div>
                <h2 className="text-lg font-bold text-slate-100 font-display">Historical Valuation</h2>
                <p className="text-xxs font-semibold text-slate-500 uppercase tracking-wider mt-1">Timeline historical performance</p>
              </div>

              <div className="mt-8">
                {chartLoading ? (
                  <div className="h-64 flex items-center justify-center bg-slate-905/30 rounded-2xl">
                    <Sparkles className="w-8 h-8 text-indigo-500 animate-spin" />
                  </div>
                ) : (
                  <StockChart 
                    data={history} 
                    symbol={symbol} 
                    timeframe={timeframe} 
                    setTimeframe={setTimeframe} 
                    changePercent={quote?.dp} 
                  />
                )}
              </div>
            </GlassCard>

            {/* Key Statistics Grid */}
            <GlassCard hover={false}>
              <h2 className="text-lg font-bold text-slate-100 font-display border-b border-slate-800 pb-3">Key Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 mt-6">
                {keyStats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xxs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
                    <p className="text-sm font-extrabold text-slate-200 mt-1 font-display">{stat.value}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Company Bio */}
            {profile?.description && (
              <GlassCard hover={false}>
                <h2 className="text-lg font-bold text-slate-100 font-display border-b border-slate-800 pb-3">About Company</h2>
                <p className="text-xs text-slate-400 leading-relaxed font-medium mt-4">{profile.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-805 text-xs font-semibold">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-400">HQ:</span>
                    <span className="text-slate-200">{profile.headquarters || 'USA'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-400">CEO:</span>
                    <span className="text-slate-200">{profile.ceo || 'N/A'}</span>
                  </div>
                  {profile.weburl && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-slate-500" />
                      <a href={profile.weburl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </GlassCard>
            )}
          </div>

          {/* Trade Panel and News Columns */}
          <div className="space-y-8">
            {quote && (
              <TradingPanel 
                stockSymbol={symbol} 
                companyName={profile?.name || symbol} 
                livePrice={quote.c} 
                ownedQuantity={ownedQty} 
                onTradeSuccess={fetchStockData} 
              />
            )}

            {/* News feed column */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-300 font-display">News & Updates</h3>
              <NewsFeed news={news} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StockDetails;
