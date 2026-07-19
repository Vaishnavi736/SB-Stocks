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
  Flame,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layout/DashboardLayout';
import GlassCard from '../components/GlassCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import TabSwitch from '../components/TabSwitch';

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
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="text-3xl font-extrabold text-text-primary font-display">Markets</h1>
          <p className="text-xs text-text-secondary mt-1">Search, bookmark, and trade US Stocks live.</p>
        </motion.div>

        {/* Filter Utilities Bar */}
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-stretch xl:items-center">
          {/* Movers category tabs */}
          <TabSwitch
            layoutId="market-filter-pill"
            className="max-w-md shrink-0"
            active={activeFilter}
            onChange={setActiveFilter}
            tabs={[
              { id: 'ALL', label: 'All Stocks', icon: Activity },
              { id: 'GAINERS', label: 'Top Gainers', icon: TrendingUp },
              { id: 'LOSERS', label: 'Top Losers', icon: TrendingDown },
              { id: 'TRENDING', label: 'High Volume', icon: Flame }
            ]}
          />

          {/* Search Input */}
          <div className="relative max-w-sm flex-1">
            <input
              type="text"
              placeholder="Search by symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-surface-sunken border border-border-default rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-text-primary"
            />
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-text-muted" />
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
                  ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-600/10'
                  : 'bg-surface-sunken border-border-subtle text-text-muted hover:text-text-primary hover:border-border-default'
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
            <GlassCard className="p-0 overflow-hidden border-border-subtle" hover={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle text-xxs font-bold uppercase tracking-wider text-text-muted bg-surface-sunken">
                      <th className="px-6 py-4">Symbol</th>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4 text-right">Price</th>
                      <th className="px-6 py-4 text-right">Change</th>
                      <th className="px-6 py-4 text-right">Volume</th>
                      <th className="px-6 py-4 text-center">Watchlist</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-sm font-semibold">
                    {paginatedStocks.map((stock) => {
                      const inWatchlist = watchlistSymbols.includes(stock.symbol);
                      return (
                        <tr
                          key={stock.symbol}
                          className="hover:bg-surface-sunken/60 transition-colors group"
                        >
                          {/* Symbol */}
                          <td className="px-6 py-4">
                            <Link to={`/stocks/${stock.symbol}`} className="font-extrabold text-brand-500 hover:text-brand-400">
                              {stock.symbol}
                            </Link>
                          </td>
                          {/* Company name */}
                          <td className="px-6 py-4">
                            <div>
                              <span className="text-text-primary block text-xs truncate max-w-40 md:max-w-64">{stock.name}</span>
                              <span className="text-xxs text-text-muted font-medium bg-surface-sunken px-2 py-0.5 rounded mt-0.5 inline-block">
                                {stock.sector}
                              </span>
                            </div>
                          </td>
                          {/* Price */}
                          <td className="px-6 py-4 text-right font-display text-text-primary font-bold">
                            ${stock.price.toFixed(2)}
                          </td>
                          {/* Change */}
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center text-xs font-bold ${
                              stock.changePercent >= 0 ? 'text-success-500' : 'text-danger-500'
                            }`}>
                              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </span>
                          </td>
                          {/* Volume */}
                          <td className="px-6 py-4 text-right text-xs text-text-secondary">
                            {stock.volume.toLocaleString()}
                          </td>
                          {/* Watchlist toggle */}
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={(e) => handleWatchlistToggle(stock.symbol, stock.name, e)}
                              className={`p-2 rounded-xl transition-all border ${
                                inWatchlist
                                  ? 'bg-amber-950/40 border-amber-500/25 text-amber-400'
                                  : 'bg-surface-raised border-border-subtle text-text-muted hover:text-text-secondary'
                              }`}
                            >
                              <Star className={`w-4 h-4 ${inWatchlist ? 'fill-amber-400' : ''}`} />
                            </button>
                          </td>
                          {/* Buy/Sell Action Link */}
                          <td className="px-6 py-4 text-center">
                            <Link
                              to={`/stocks/${stock.symbol}`}
                              className="rgb-glow inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-900/10"
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
              <div className="flex items-center justify-between border-t border-border-subtle pt-6">
                <span className="text-xs text-text-muted">
                  Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredStocks.length)} of {filteredStocks.length} Stocks
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-border-subtle hover:bg-surface-sunken rounded-xl text-text-secondary disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-text-secondary font-bold px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-border-subtle hover:bg-surface-sunken rounded-xl text-text-secondary disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <GlassCard className="text-center py-20" hover={false}>
            <Search className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-bold text-text-primary font-display">No Stocks Found</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mt-2 leading-relaxed">No stocks matched your current search parameters. Try adjusting your category filters or search text.</p>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Market;
