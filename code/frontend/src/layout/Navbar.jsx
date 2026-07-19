import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sun, Moon, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';

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
    <header className="fixed top-0 left-0 right-0 z-40 grid grid-cols-[auto_1fr_auto] items-center gap-4 h-16 px-6 bg-surface-raised/90 backdrop-blur-md border-b border-border-subtle">
      {/* Logo */}
      <Logo to="/dashboard" size="md" className="shrink-0" />

      {/* Global Stock Search Bar — centered in the middle grid track regardless of side widths */}
      <div className="flex justify-center min-w-0">
        {user && (
          <div className="relative w-full max-w-lg" ref={dropdownRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search stocks (e.g. AAPL, MSFT)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full h-10 pl-10 pr-4 text-sm bg-surface-sunken border border-border-default rounded-full focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 text-text-primary transition-colors"
                />
              </div>
            </form>

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && (searchQuery.trim() || recentSearches.length > 0) && (
              <div className="absolute top-12 left-0 right-0 max-h-80 overflow-y-auto bg-surface-raised border border-border-subtle rounded-2xl shadow-elevation-3 z-50 p-2">
                {searchQuery.trim() ? (
                  suggestions.length > 0 ? (
                    suggestions.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => handleSelectSymbol(stock.symbol)}
                        className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-surface-sunken rounded-xl text-left transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-text-primary">{stock.symbol}</span>
                          <span className="ml-2 text-xs text-text-secondary">{stock.name}</span>
                        </div>
                        <span className="text-xs font-medium text-text-muted px-2 py-0.5 bg-surface-sunken rounded-md">
                          {stock.sector}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-text-muted text-center">No results found for "{searchQuery}"</div>
                  )
                ) : (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Recent Searches</div>
                    {recentSearches.map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => handleSelectSymbol(symbol)}
                        className="flex items-center w-full px-4 py-2 hover:bg-surface-sunken rounded-xl text-left text-sm text-text-secondary font-medium transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 text-text-muted mr-2" />
                        {symbol}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Navbar Utility Controls */}
      <div className="flex items-center justify-end space-x-4">
        {user && (
          <div className="w-px h-6 bg-border-subtle hidden sm:block"></div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-sunken transition-colors"
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
              className="w-8.5 h-8.5 rounded-full border border-border-subtle bg-surface-sunken"
            />
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-semibold text-text-primary">{user.name}</span>
              {user.isAdmin && (
                <span className="text-xxs font-bold text-brand-500 uppercase tracking-widest leading-none">Admin</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-sunken rounded-xl transition-all">Sign In</Link>
            <Link to="/register" className="rgb-glow px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-600/20 transition-all">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
