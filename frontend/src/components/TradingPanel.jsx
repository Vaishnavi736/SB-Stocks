import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import GlassCard from './GlassCard';

const TradingPanel = ({ stockSymbol, companyName, livePrice, ownedQuantity = 0, onTradeSuccess }) => {
  const { user, refreshProfile } = useAuth();
  const [tab, setTab] = useState('BUY'); // BUY or SELL
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const parsedQty = parseFloat(quantity) || 0;
  const totalAmount = parseFloat((parsedQty * livePrice).toFixed(2));

  // Input check states
  const hasFunds = tab === 'BUY' ? user?.virtualBalance >= totalAmount : true;
  const hasShares = tab === 'SELL' ? ownedQuantity >= parsedQty : true;
  const isInputValid = parsedQty > 0;

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    if (!isInputValid) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (tab === 'BUY' && !hasFunds) {
      toast.error('Insufficient virtual cash balance');
      return;
    }

    if (tab === 'SELL' && !hasShares) {
      toast.error('You do not own enough shares to sell');
      return;
    }

    setLoading(true);
    const endpoint = tab === 'BUY' ? '/api/portfolio/buy' : '/api/portfolio/sell';
    
    try {
      const response = await axios.post(endpoint, {
        stockSymbol,
        companyName,
        quantity: parsedQty,
        price: livePrice
      });

      if (response.data && response.data.success) {
        toast.success(response.data.message);
        setQuantity('');
        // Refresh contexts and parent states
        await refreshProfile();
        if (onTradeSuccess) {
          onTradeSuccess();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Transaction execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="w-full shadow-xl" hover={false}>
      {/* Tabs BUY/SELL */}
      <div className="flex border-b border-slate-800 pb-4 mb-5">
        <button
          onClick={() => { setTab('BUY'); setQuantity(''); }}
          className={`flex-1 py-2.5 text-center text-sm font-bold rounded-xl transition-all ${
            tab === 'BUY'
              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Buy {stockSymbol}
        </button>
        <button
          onClick={() => { setTab('SELL'); setQuantity(''); }}
          className={`flex-1 py-2.5 text-center text-sm font-bold rounded-xl transition-all ${
            tab === 'SELL'
              ? 'bg-rose-950/50 text-rose-400 border border-rose-500/30'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Sell {stockSymbol}
        </button>
      </div>

      <form onSubmit={handleTradeSubmit} className="space-y-4">
        {/* Market Price Display */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400 font-medium">Market Price</span>
          <span className="font-bold text-slate-100 font-display">
            ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Owned Quantity Display */}
        {ownedQuantity > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-medium">Owned Shares</span>
            <span className="font-bold text-indigo-400">{ownedQuantity}</span>
          </div>
        )}

        {/* Quantity Input Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quantity</label>
          <input
            type="number"
            placeholder="0"
            min="1"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full h-11 px-4 text-slate-100 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold"
            required
          />
        </div>

        <div className="w-full border-t border-slate-800/80 my-3"></div>

        {/* Totals */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400 font-medium">Estimated {tab === 'BUY' ? 'Cost' : 'Credit'}</span>
          <span className="font-extrabold text-slate-100 font-display text-lg">
            ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* User Balance warning */}
        {tab === 'BUY' && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Buying Power:</span>
            <span className={`font-semibold ${hasFunds ? 'text-slate-300' : 'text-rose-400'}`}>
              ${user?.virtualBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || !isInputValid || (tab === 'BUY' && !hasFunds) || (tab === 'SELL' && !hasShares)}
          className={`w-full h-12 text-sm font-bold rounded-xl shadow-lg transition-all ${
            tab === 'BUY'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/10 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none'
          }`}
        >
          {loading ? 'Executing trade...' : `${tab === 'BUY' ? 'Buy' : 'Sell'} Stock`}
        </button>
      </form>
    </GlassCard>
  );
};

export default TradingPanel;
