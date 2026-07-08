import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';
import {
  Briefcase,
  DollarSign,
  Activity,
  Percent,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layout/DashboardLayout';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#14b8a6', '#06b6d4'];

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-surface-raised border border-border-subtle p-3 rounded-2xl shadow-xl backdrop-blur-md text-xs font-semibold">
        <p className="text-text-primary">{data.name}</p>
        <p className="text-brand-500 mt-1">Value: ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        <p className="text-text-muted font-medium">Allocation: {data.payload.percent.toFixed(2)}%</p>
      </div>
    );
  }
  return null;
};

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get('/api/portfolio');
      if (response.data && response.data.success) {
        setPortfolio(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load portfolio details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <LoadingSkeleton.Grid count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <LoadingSkeleton.Card height="h-[365px]" />
            </div>
            <div>
              <LoadingSkeleton.Card height="h-[365px]" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const holdings = portfolio?.holdings || [];
  const totalValue = portfolio?.totalPortfolioValue || 100000;
  const cash = portfolio?.virtualBalance || 100000;
  const investment = portfolio?.totalInvestment || 0;
  const currentHoldingsValue = portfolio?.currentHoldingsValue || 0;
  const totalPL = portfolio?.totalProfitLoss || 0;
  const totalPLPct = portfolio?.totalProfitLossPercentage || 0;

  // Build data points for the Sector Allocation Pie Chart
  const allocationMap = {};
  holdings.forEach((h) => {
    const assetValue = h.currentValue;
    const name = h.stockSymbol;
    allocationMap[name] = (allocationMap[name] || 0) + assetValue;
  });

  const pieData = Object.keys(allocationMap).map((key) => ({
    name: key,
    value: parseFloat(allocationMap[key].toFixed(2)),
    percent: totalValue > 0 ? (allocationMap[key] / totalValue) * 100 : 0
  }));

  // Add Cash as a segment for completeness
  if (cash > 0) {
    pieData.push({
      name: 'Cash',
      value: parseFloat(cash.toFixed(2)),
      percent: totalValue > 0 ? (cash / totalValue) * 100 : 0
    });
  }

  // Sorting pie segments for visually balanced alignment
  pieData.sort((a, b) => b.value - a.value);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="text-3xl font-extrabold text-text-primary font-display">Portfolio</h1>
          <p className="text-xs text-text-secondary mt-1">Valuations, sector allocations, and current holdings.</p>
        </motion.div>

        {/* Statistic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Portfolio Value"
            value={totalValue}
            prefix="$"
            change={totalPL}
            changePercent={totalPLPct}
            icon={Briefcase}
            glow={true}
          />
          <StatCard
            title="Virtual Balance"
            value={cash}
            prefix="$"
            icon={DollarSign}
            description="Simulated cash balance"
          />
          <StatCard
            title="Total Cost Basis"
            value={investment}
            prefix="$"
            icon={Percent}
            description="Total Virtual Invested Amount"
          />
          <StatCard
            title="Live Positions Value"
            value={currentHoldingsValue}
            prefix="$"
            icon={Activity}
            description="Total market value of assets"
          />
        </div>

        {/* Pie Chart & Performance Summary */}
        {holdings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Holdings Table Card */}
            <GlassCard className="lg:col-span-2 overflow-hidden p-0 border-border-subtle" hover={false}>
              <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-primary font-display">Holdings Summary</h2>
                <span className="text-xxs font-bold text-text-muted uppercase bg-surface-raised border border-border-subtle px-3 py-1 rounded-full">
                  {holdings.length} Positions Active
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle text-xxs font-bold uppercase tracking-wider text-text-muted bg-surface-sunken">
                      <th className="px-6 py-4">Symbol</th>
                      <th className="px-6 py-4 text-right">Shares</th>
                      <th className="px-6 py-4 text-right">Avg Cost</th>
                      <th className="px-6 py-4 text-right">Current Price</th>
                      <th className="px-6 py-4 text-right">Valuation</th>
                      <th className="px-6 py-4 text-right">Profit / Loss</th>
                      <th className="px-6 py-4 text-center">Trade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-sm font-semibold">
                    {holdings.map((h) => {
                      const isHoldingPositive = h.profitLoss >= 0;
                      return (
                        <tr key={h._id} className="hover:bg-surface-sunken/60 transition-colors">
                          <td className="px-6 py-4">
                            <Link to={`/stocks/${h.stockSymbol}`} className="font-extrabold text-brand-500 hover:text-brand-400">
                              {h.stockSymbol}
                            </Link>
                            <span className="block text-xxs text-text-muted font-medium max-w-28 truncate">{h.companyName}</span>
                          </td>
                          <td className="px-6 py-4 text-right text-text-secondary font-mono text-xs">{h.quantity}</td>
                          <td className="px-6 py-4 text-right text-text-secondary font-mono text-xs">${h.averageBuyPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right text-text-primary font-mono text-xs">${h.currentPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right text-text-primary font-display font-bold">${h.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col text-right">
                              <span className={`text-xs font-bold ${isHoldingPositive ? 'text-success-500' : 'text-danger-500'}`}>
                                {isHoldingPositive ? '+' : ''}${h.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              <span className={`text-xxs font-semibold mt-0.5 ${isHoldingPositive ? 'text-success-500/80' : 'text-danger-500/80'}`}>
                                {isHoldingPositive ? '+' : ''}{h.profitLossPercentage.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link
                              to={`/stocks/${h.stockSymbol}`}
                              className="inline-flex p-2 bg-surface-raised border border-border-subtle hover:bg-brand-600 hover:text-white rounded-xl text-text-secondary transition-all"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Asset Allocation Chart Card */}
            <GlassCard className="flex flex-col" hover={false}>
              <h2 className="text-lg font-bold text-text-primary font-display border-b border-border-subtle pb-3 mb-6">Asset Allocation</h2>
              <div className="h-64 relative flex items-center justify-center flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={40} 
                      iconSize={10} 
                      iconType="circle"
                      formatter={(val) => <span className="text-text-secondary text-xs font-bold ml-1.5">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        ) : (
          <GlassCard className="text-center py-24" hover={false}>
            <Briefcase className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-bold text-text-primary font-display">No Holdings Active</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mt-2 leading-relaxed">You haven't bought any stocks yet. Head over to the Market page and execute your first paper trade!</p>
            <Link to="/market" className="rgb-glow inline-flex items-center space-x-1 px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-brand-600/10 mt-6 transition-all">
              <Plus className="w-4 h-4" />
              <span>Browse Market</span>
            </Link>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
