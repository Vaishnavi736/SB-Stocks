import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  History, 
  Download, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import GlassCard from '../components/GlassCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters state
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, BUY, SELL
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        search: searchQuery,
      };

      if (activeTab !== 'ALL') {
        params.type = activeTab;
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const response = await axios.get('/api/transactions', { params });
      if (response.data && response.data.success) {
        setTransactions(response.data.transactions);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.totalItems);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error.message);
      toast.error('Could not retrieve transaction logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, activeTab, startDate, endDate]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  // Trigger search on debounce query
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      fetchTransactions();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // CSV Export utility
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const params = { format: 'csv' };
      if (activeTab !== 'ALL') {
        params.type = activeTab;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await axios.get('/api/transactions', {
        params,
        responseType: 'blob' // Essential for binary/stream downloads
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SB_Stocks_Transactions_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Transaction history exported successfully');
    } catch (error) {
      console.error('CSV Export Error:', error.message);
      toast.error('Failed to compile CSV records');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Title & CSV Export */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 font-display">Transaction Log</h1>
            <p className="text-xs text-slate-400 mt-1">Audit trail of paper trades and cash balance exchanges.</p>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-center">
          {/* Tab Selector */}
          <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl text-xs font-bold text-slate-400 xl:col-span-2">
            {[
              { id: 'ALL', label: 'All Operations' },
              { id: 'BUY', label: 'Buys Only' },
              { id: 'SELL', label: 'Sells Only' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                className={`flex-1 py-2.5 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-slate-100 border border-slate-700/80 shadow-md'
                    : 'hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative xl:col-span-1">
            <input
              type="text"
              placeholder="Search symbol (e.g. AAPL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-slate-900 border border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200"
            />
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
          </div>

          {/* Date range filters */}
          <div className="flex items-center space-x-2 xl:col-span-1 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full h-11 px-3 bg-slate-900 border border-slate-850 rounded-2xl text-slate-400 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-slate-600">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full h-11 px-3 bg-slate-900 border border-slate-850 rounded-2xl text-slate-400 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Transactions Table Grid */}
        {loading ? (
          <LoadingSkeleton.Table rows={8} cols={6} />
        ) : transactions.length > 0 ? (
          <div className="space-y-6">
            <GlassCard className="p-0 overflow-hidden border-slate-800" hover={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-xxs font-bold uppercase tracking-wider text-slate-500 bg-slate-900/35">
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Symbol</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4 text-right">Shares</th>
                      <th className="px-6 py-4 text-right">Price</th>
                      <th className="px-6 py-4 text-right">Total Amount</th>
                      <th className="px-6 py-4 text-right">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-sm font-semibold">
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-slate-905/30 transition-colors">
                        {/* ID */}
                        <td className="px-6 py-4 font-mono text-xxs text-slate-500">
                          {tx._id}
                        </td>
                        {/* Symbol */}
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-extrabold text-slate-200 block">{tx.stockSymbol}</span>
                            <span className="text-xxs text-slate-500 font-medium truncate block max-w-28">{tx.companyName}</span>
                          </div>
                        </td>
                        {/* Type Status Badge */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xxs font-bold border ${
                            tx.type === 'BUY' 
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/10' 
                              : 'bg-rose-950/40 text-rose-400 border-rose-500/10'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        {/* Shares */}
                        <td className="px-6 py-4 text-right text-slate-300 font-mono text-xs">
                          {tx.quantity}
                        </td>
                        {/* Price */}
                        <td className="px-6 py-4 text-right text-slate-400 font-mono text-xs">
                          ${tx.price.toFixed(2)}
                        </td>
                        {/* Total Value */}
                        <td className="px-6 py-4 text-right text-slate-100 font-display font-bold">
                          ${tx.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        {/* Date Time */}
                        <td className="px-6 py-4 text-right text-xs text-slate-400">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-900 pt-6">
                <span className="text-xs text-slate-500">
                  Showing {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, totalCount)} of {totalCount} Transactions
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-855 hover:bg-slate-900 rounded-xl text-slate-400 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400 font-bold px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-855 hover:bg-slate-900 rounded-xl text-slate-400 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <GlassCard className="text-center py-20" hover={false}>
            <History className="w-12 h-12 mx-auto text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-300 font-display">No Transactions Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">No paper trades have been recorded. Adjust filters or make a trade on the stock markets page.</p>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
