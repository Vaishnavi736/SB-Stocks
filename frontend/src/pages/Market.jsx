import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Search, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Activity, 
  Plus, 
  Check, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import GlassCard from '../components/GlassCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Market = () => {
  const [stocks, setStocks] = useState([]);
  const [watchlistSymbols, setWatchlistSymbols] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, GAINERS, LOSERS, TRENDING
  const [activeSector, setActiveSector] = useState('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const sectors = ['All', 'Technology', 'Consumer Cyclical', 'Financials', 'Consumer Defensive', 'Communication Services'];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [marketResponse, watchlistResponse] = await Promise.all([
        axios.get('/api/stocks'),
        axios.get('/api/watchlist')
      ]);

      if (watchlistResponse.data && watchlistResponse.data.success) {
        setWatchlistSymbols(watchlistResponse.data.watchlist.map(item => item.stockSymbol));
      }

      if (marketResponse.data && marketResponse.data.success) {
        // Build a consolidated array of all mock stocks with live stats
        const movers = marketResponse.data;
        const allList = [];
        
        // Merge trending, gainers and losers without duplicates
        const uniqueSymbols = new Set();
        const addStocksFromList = (list) => {
          list.forEach(item => {
            if (!uniqueSymbols.has(item.symbol)) {
              uniqueSymbols.add(item.symbol);
              allList.push(item);
            }
          });
        };

        addStocksFromList(movers.trending || []);
        addStocksFromList(movers.gainers || []);
        addStocksFromList(movers.losers || []);

        setStocks(allList);
      }
    } catch (error) {
      console.error('Error fetching market details:', error.message);
      toast.error('Failed to load market listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Watchlist Toggle Handler
  const handleWatchlistToggle = async (symbol, name, e) => {
    e.preventDefault(); // Prevent navigating to Stock details
    e.stopPropagation();

    const isAdded = watchlistSymbols.includes(symbol);

    try {
      if (isAdded) {
        const response = await axios.delete(`/api/watchlist/${symbol}`);
        if (response.data && response.data.success) {
          setWatchlistSymbols(prev => prev.filter(s => s !== symbol));
          toast.success(`${symbol} removed from watchlist`);
        }
      } else {
        const response = await axios.post('/api/watchlist', {
          stockSymbol: symbol,
          companyName: name
        });
        if (response.data && response.data.success) {
          setWatchlistSymbols(prev => [...prev, symbol]);
          toast.success(`${symbol} added to watchlist`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Watchlist request failed');
    }
  };

  // Filter and Search logic
  const filteredStocks = stocks.filter(stock => {
    // Search match
    const searchMatch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Sector match
    const sectorMatch = activeSector === 'All' || stock.sector === activeSector;

    return searchMatch && sectorMatch;
  }).sort((a, b) => {
    // Filter sorting (gainers, losers, trending)
    if (activeFilter === 'GAINERS') {
      return b.changePercent - a.changePercent;
    } else if (activeFilter === 'LOSERS') {
      return a.changePercent - b.changePercent;
    } else if (activeFilter === 'TRENDING') {
      return b.volume - a.volume;
    }
    return 0; // Default sorting (no extra sort)
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStocks = filteredStocks.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter, activeSector]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 font-display">Markets</h1>
          <p className="text-xs text-slate-400 mt-1">Search, bookmark, and trade US Stocks live.</p>
        </div>

        {/* Filter Utilities Bar */}
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-stretch xl:items-center">
          {/* Movers category tabs */}
          <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl text-xs font-bold text-slate-400 max-w-md shrink-0">
            {[
              { id: 'ALL', label: 'All Stocks', icon: Activity },
              { id: 'GAINERS', label: 'Top Gainers', icon: TrendingUp },
              { id: 'LOSERS', label: 'Top Losers', icon: TrendingDown },
              { id: 'TRENDING', label: 'High Volume', icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl transition-all ${
                    activeFilter === tab.id
                      ? 'bg-slate-800 text-slate-100 border border-slate-700/80 shadow-md'
                      : 'hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative max-w-sm flex-1">
            <input
              type="text"
              placeholder="Search by symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-slate-900 border border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200"
            />
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* Sector filtering list */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSector(sec)}
              className={`px-4 py-2 text-xxs font-extrabold uppercase tracking-widest rounded-full transition-all shrink-0 border ${
                activeSector === sec
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Table/List View */}
        {loading ? (
          <LoadingSkeleton.Table rows={8} cols={6} />
        ) : paginatedStocks.length > 0 ? (
          <div className="space-y-6">
            <GlassCard className="p-0 overflow-hidden border-slate-800" hover={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-xxs font-bold uppercase tracking-wider text-slate-500 bg-slate-900/35">
                      <th className="px-6 py-4">Symbol</th>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4 text-right">Price</th>
                      <th className="px-6 py-4 text-right">Change</th>
                      <th className="px-6 py-4 text-right">Volume</th>
                      <th className="px-6 py-4 text-center">Watchlist</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-sm font-semibold">
                    {paginatedStocks.map((stock) => {
                      const inWatchlist = watchlistSymbols.includes(stock.symbol);
                      return (
                        <tr 
                          key={stock.symbol}
                          className="hover:bg-slate-900/25 transition-colors group"
                        >
                          {/* Symbol */}
                          <td className="px-6 py-4">
                            <Link to={`/stocks/${stock.symbol}`} className="font-extrabold text-indigo-400 hover:text-indigo-300">
                              {stock.symbol}
                            </Link>
                          </td>
                          {/* Company name */}
                          <td className="px-6 py-4">
                            <div>
                              <span className="text-slate-200 block text-xs truncate max-w-40 md:max-w-64">{stock.name}</span>
                              <span className="text-xxs text-slate-500 font-medium bg-slate-950 px-2 py-0.5 rounded mt-0.5 inline-block">
                                {stock.sector}
                              </span>
                            </div>
                          </td>
                          {/* Price */}
                          <td className="px-6 py-4 text-right font-display text-slate-200 font-bold">
                            ${stock.price.toFixed(2)}
                          </td>
                          {/* Change */}
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center text-xs font-bold ${
                              stock.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </span>
                          </td>
                          {/* Volume */}
                          <td className="px-6 py-4 text-right text-xs text-slate-400">
                            {stock.volume.toLocaleString()}
                          </td>
                          {/* Watchlist toggle */}
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={(e) => handleWatchlistToggle(stock.symbol, stock.name, e)}
                              className={`p-2 rounded-xl transition-all border ${
                                inWatchlist 
                                  ? 'bg-amber-950/40 border-amber-500/25 text-amber-400' 
                                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              <Star className={`w-4 h-4 ${inWatchlist ? 'fill-amber-400' : ''}`} />
                            </button>
                          </td>
                          {/* Buy/Sell Action Link */}
                          <td className="px-6 py-4 text-center">
                            <Link
                              to={`/stocks/${stock.symbol}`}
                              className="inline-flex items-center px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-900/10"
                            >
                              Trade
                              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-900 pt-6">
                <span className="text-xs text-slate-500">
                  Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredStocks.length)} of {filteredStocks.length} Stocks
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-slate-400 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400 font-bold px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-slate-400 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <GlassCard className="text-center py-20" hover={false}>
            <Search className="w-12 h-12 mx-auto text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-300 font-display">No Stocks Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">No stocks matched your current search parameters. Try adjusting your category filters or search text.</p>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Market;
