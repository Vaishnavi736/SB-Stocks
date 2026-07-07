import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Flame, Sun, Moon, Sparkles, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 1) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await axios.get(`/api/stocks?search=${searchQuery}`);
        if (response.data && response.data.success) {
          setSuggestions(response.data.results);
        }
      } catch (err) {
        console.error('Error fetching search results:', err.message);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectSymbol = (symbol) => {
    setSearchQuery('');
    setShowSuggestions(false);
    
    // Save to recents
    const updatedRecents = [symbol, ...recentSearches.filter(s => s !== symbol)].slice(0, 5);
    setRecentSearches(updatedRecents);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecents));
    
    navigate(`/stocks/${symbol}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSelectSymbol(searchQuery.trim().toUpperCase());
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-6 bg-slate-900 border-b border-slate-800">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center space-x-2 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white font-display">
          SB <span className="text-indigo-400">Stocks</span>
        </span>
      </Link>

      {/* Global Stock Search Bar */}
      {user && (
        <div className="relative flex-1 max-w-md mx-6" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search stocks (e.g. AAPL, MSFT)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full h-10 pl-10 pr-4 text-sm bg-slate-950 border border-slate-800 rounded-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 transition-colors"
              />
              <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-500" />
            </div>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && (searchQuery.trim() || recentSearches.length > 0) && (
            <div className="absolute top-11 left-0 right-0 max-h-80 overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2">
              {searchQuery.trim() ? (
                suggestions.length > 0 ? (
                  suggestions.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleSelectSymbol(stock.symbol)}
                      className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-slate-800 rounded-xl text-left transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-slate-100">{stock.symbol}</span>
                        <span className="ml-2 text-xs text-slate-400">{stock.name}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-500 px-2 py-0.5 bg-slate-950 rounded-md">
                        {stock.sector}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-500 text-center">No results found for "{searchQuery}"</div>
                )
              ) : (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Searches</div>
                  {recentSearches.map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => handleSelectSymbol(symbol)}
                      className="flex items-center w-full px-4 py-2 hover:bg-slate-800 rounded-xl text-left text-sm text-slate-300 font-medium transition-colors"
                    >
                      <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
                      {symbol}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Right Navbar Utility Controls */}
      <div className="flex items-center space-x-4">
        {user && (
          <>
            {/* Gamification Streak */}
            <div className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-orange-950/40 border border-orange-500/20 text-orange-400 text-xs font-bold" title="Daily Login Streak">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>{user.loginStreak} Day{user.loginStreak > 1 ? 's' : ''}</span>
            </div>

            {/* Cash Balance Display */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500">Buying Power</span>
              <span className="text-sm font-bold text-emerald-400 font-display">
                ${user.virtualBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="w-px h-6 bg-slate-800 hidden sm:block"></div>
          </>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Account / Admin Badge */}
        {user ? (
          <div className="flex items-center space-x-2">
            <img
              src={user.avatar}
              alt="avatar"
              className="w-8.5 h-8.5 rounded-full border border-slate-700 bg-slate-800"
            />
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-semibold text-slate-200">{user.name}</span>
              {user.isAdmin && (
                <span className="text-xxs font-bold text-indigo-400 uppercase tracking-widest leading-none">Admin</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all">Sign In</Link>
            <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/10 transition-all">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
