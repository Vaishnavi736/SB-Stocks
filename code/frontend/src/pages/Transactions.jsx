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
import { motion } from 'framer-motion';
import DashboardLayout from '../layout/DashboardLayout';
import GlassCard from '../components/GlassCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Badge from '../components/Badge';
import TabSwitch from '../components/TabSwitch';

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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary font-display">Transaction Log</h1>
            <p className="text-xs text-text-secondary mt-1">Audit trail of paper trades and cash balance exchanges.</p>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="rgb-glow inline-flex items-center space-x-1.5 px-4.5 py-2.5 bg-surface-raised border border-border-subtle hover:bg-surface-sunken text-text-secondary hover:text-text-primary font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-brand-500" />
              <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
          )}
        </motion.div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-center">
          {/* Tab Selector */}
          <TabSwitch
            layoutId="transaction-tab-pill"
            className="xl:col-span-2"
            active={activeTab}
            onChange={(id) => { setActiveTab(id); setCurrentPage(1); }}
            tabs={[
              { id: 'ALL', label: 'All Operations' },
              { id: 'BUY', label: 'Buys Only' },
              { id: 'SELL', label: 'Sells Only' }
            ]}
          />

          {/* Search bar */}
          <div className="relative xl:col-span-1">
            <input
              type="text"
              placeholder="Search symbol (e.g. AAPL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-surface-sunken border border-border-default rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 text-text-primary"
            />
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-text-muted" />
          </div>

          {/* Date range filters */}
          <div className="flex items-center space-x-2 xl:col-span-1 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full h-11 px-3 bg-surface-sunken border border-border-default rounded-2xl text-text-primary font-semibold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            />
            <span className="text-text-muted">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full h-11 px-3 bg-surface-sunken border border-border-default rounded-2xl text-text-primary font-semibold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>

        {/* Transactions Table Grid */}
        {loading ? (
          <LoadingSkeleton.Table rows={8} cols={6} />
        ) : transactions.length > 0 ? (
          <div className="space-y-6">
            <GlassCard className="p-0 overflow-hidden border-border-subtle" hover={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle text-xxs font-bold uppercase tracking-wider text-text-muted bg-surface-sunken">
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Symbol</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4 text-right">Shares</th>
                      <th className="px-6 py-4 text-right">Price</th>
                      <th className="px-6 py-4 text-right">Total Amount</th>
                      <th className="px-6 py-4 text-right">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-sm font-semibold">
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-surface-sunken/60 transition-colors">
                        {/* ID */}
                        <td className="px-6 py-4 font-mono text-xxs text-text-muted">
                          {tx._id}
                        </td>
                        {/* Symbol */}
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-extrabold text-text-primary block">{tx.stockSymbol}</span>
                            <span className="text-xxs text-text-muted font-medium truncate block max-w-28">{tx.companyName}</span>
                          </div>
                        </td>
                        {/* Type Status Badge */}
                        <td className="px-6 py-4">
                          <Badge tone={tx.type === 'BUY' ? 'success' : 'danger'}>
                            {tx.type}
                          </Badge>
                        </td>
                        {/* Shares */}
                        <td className="px-6 py-4 text-right text-text-secondary font-mono text-xs">
                          {tx.quantity}
                        </td>
                        {/* Price */}
                        <td className="px-6 py-4 text-right text-text-secondary font-mono text-xs">
                          ${tx.price.toFixed(2)}
                        </td>
                        {/* Total Value */}
                        <td className="px-6 py-4 text-right text-text-primary font-display font-bold">
                          ${tx.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        {/* Date Time */}
                        <td className="px-6 py-4 text-right text-xs text-text-secondary">
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
              <div className="flex items-center justify-between border-t border-border-subtle pt-6">
                <span className="text-xs text-text-muted">
                  Showing {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, totalCount)} of {totalCount} Transactions
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-border-subtle hover:bg-surface-sunken rounded-xl text-text-secondary disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-text-secondary font-bold px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
            <History className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-bold text-text-primary font-display">No Transactions Found</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mt-2 leading-relaxed">No paper trades have been recorded. Adjust filters or make a trade on the stock markets page.</p>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
