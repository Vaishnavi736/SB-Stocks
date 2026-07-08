import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Star,
  Users,
  Flame,
  Award,
  Wallet,
  History,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import StockChart from '../components/StockChart';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Badge from '../components/Badge';
import AnimatedCounter from '../components/AnimatedCounter';
import TabSwitch from '../components/TabSwitch';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] } })
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMoverTab, setActiveMoverTab] = useState('trending'); // trending, gainers, losers

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      if (response.data && response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <LoadingSkeleton.Grid count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <LoadingSkeleton.Card height="h-[360px]" />
            </div>
            <div>
              <LoadingSkeleton.Card height="h-[360px]" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const portfolio = data?.portfolio || {
    totalPortfolioValue: 100000,
    virtualBalance: 100000,
    holdingsValue: 0,
    totalInvestment: 0,
    unrealizedGainLoss: 0,
    unrealizedGainLossPct: 0,
    rank: 1
  };

  const todayProfit = portfolio.unrealizedGainLoss;
  const todayProfitPct = portfolio.unrealizedGainLossPct;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Greeting Card */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="rounded-3xl border border-border-subtle bg-surface-raised p-6 md:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <p className="text-xxs font-bold text-brand-600 uppercase tracking-widest mb-2">Welcome back</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary font-display leading-tight">
                {user?.name}
              </h1>
              <p className="text-xs md:text-sm text-text-secondary mt-2 max-w-md">
                Practice trading risk-free. Stock prices update in real-time — here's where things stand today.
              </p>
            </div>

            {/* Uniform stat chips — identical structure/size so the row stays perfectly aligned */}
            <div className={`grid gap-3 w-full lg:w-auto ${portfolio.rank ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {portfolio.rank && (
                <div className="flex flex-col items-center justify-center text-center px-4 py-3.5 rounded-2xl bg-surface-sunken border border-border-subtle lg:w-28">
                  <Award className="w-4.5 h-4.5 text-brand-500 mb-1.5" />
                  <p className="text-xxs font-bold text-text-muted uppercase tracking-wider">Rank</p>
                  <p className="text-lg font-extrabold text-brand-500 font-display leading-none mt-1">#{portfolio.rank}</p>
                </div>
              )}
              <div className="flex flex-col items-center justify-center text-center px-4 py-3.5 rounded-2xl bg-surface-sunken border border-border-subtle lg:w-28">
                {todayProfit >= 0 ? (
                  <TrendingUp className="w-4.5 h-4.5 text-success-500 mb-1.5" />
                ) : (
                  <TrendingDown className="w-4.5 h-4.5 text-danger-500 mb-1.5" />
                )}
                <p className="text-xxs font-bold text-text-muted uppercase tracking-wider">Today</p>
                <p className={`text-lg font-extrabold font-display leading-none mt-1 tabular-nums ${todayProfit >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
                  {todayProfit >= 0 ? '+' : ''}<AnimatedCounter value={todayProfitPct} decimals={2} suffix="%" />
                </p>
              </div>
              <div className="flex flex-col items-center justify-center text-center px-4 py-3.5 rounded-2xl bg-surface-sunken border border-border-subtle lg:w-28">
                <Wallet className="w-4.5 h-4.5 text-text-secondary mb-1.5" />
                <p className="text-xxs font-bold text-text-muted uppercase tracking-wider">Net Worth</p>
                <p className="text-lg font-extrabold text-text-primary font-display leading-none mt-1 tabular-nums">
                  <AnimatedCounter value={portfolio.totalPortfolioValue} prefix="$" decimals={0} />
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistic Cards Grid */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.05}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Account Value"
            value={portfolio.totalPortfolioValue}
            prefix="$"
            change={todayProfit}
            changePercent={todayProfitPct}
            icon={TrendingUp}
            glow={true}
          />
          <StatCard
            title="Available Funds"
            value={portfolio.virtualBalance}
            prefix="$"
            icon={DollarSign}
            description="Available cash for trades"
          />
          <StatCard
            title="Amount Invested"
            value={portfolio.totalInvestment}
            prefix="$"
            icon={Briefcase}
            description="Virtual cash deployed in stock"
          />
          <StatCard
            title="Current Positions Value"
            value={portfolio.holdingsValue}
            prefix="$"
            icon={ArrowUpRight}
            description="Total live valuation of holdings"
          />
        </motion.div>

        {/* Growth Chart & Quick Actions */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.1}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Chart Card */}
          <GlassCard className="lg:col-span-2 h-full flex flex-col justify-between" hover={false}>
            <div>
              <h2 className="text-lg font-bold text-text-primary font-display">Account Growth</h2>
              <p className="text-xxs font-semibold text-text-muted uppercase tracking-wider mt-1">Portfolio growth over last 7 days</p>
            </div>
            
            <div className="mt-8">
              <StockChart 
                data={data?.portfolioHistory} 
                symbol="NETWORTH" 
                changePercent={todayProfitPct}
              />
            </div>
          </GlassCard>

          {/* Market Movers Card */}
          <GlassCard className="flex flex-col h-full justify-between" hover={false}>
            <div>
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h2 className="text-lg font-bold text-text-primary font-display">Market Movers</h2>
                <Link to="/market" className="text-xs font-bold text-brand-500 hover:text-brand-400">View All</Link>
              </div>

              {/* Tab Selector */}
              <TabSwitch
                layoutId="mover-tab-pill"
                className="mt-4"
                active={activeMoverTab}
                onChange={setActiveMoverTab}
                tabs={[
                  { id: 'trending', label: 'Trending' },
                  { id: 'gainers', label: 'Gainers' },
                  { id: 'losers', label: 'Losers' }
                ]}
              />

              {/* Movers List */}
              <div className="mt-4 space-y-3.5">
                {(data?.marketMovers?.[activeMoverTab] || []).slice(0, 4).map((stock) => (
                  <Link
                    to={`/stocks/${stock.symbol}`}
                    key={stock.symbol}
                    className="flex items-center justify-between p-2 hover:bg-surface-sunken/60 rounded-xl transition-all"
                  >
                    <div>
                      <span className="font-bold text-text-primary text-sm">{stock.symbol}</span>
                      <p className="text-xxs text-text-muted font-medium truncate max-w-28 sm:max-w-40">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-text-primary">${stock.price.toFixed(2)}</span>
                      <p className={`text-xxs font-bold mt-0.5 ${stock.changePercent >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Watchlist & Leaderboard & Transactions Grid */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.15}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Watchlist Card */}
          <GlassCard className="h-full flex flex-col" hover={false}>
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-brand-500 fill-brand-500" />
                <h2 className="text-lg font-bold text-text-primary font-display">Watchlist</h2>
              </div>
              <Link to="/watchlist" className="text-xs font-bold text-brand-500 hover:text-brand-400">Manage</Link>
            </div>

            {data?.watchlist?.length > 0 ? (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
                {data.watchlist.map((item) => (
                  <Link
                    key={item.symbol}
                    to={`/stocks/${item.symbol}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-surface-sunken/70 border border-border-subtle hover:bg-surface-sunken transition-colors"
                  >
                    <div>
                      <span className="text-sm font-bold text-text-primary">{item.symbol}</span>
                      <p className="text-xxs text-text-muted font-medium truncate max-w-28">{item.companyName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-text-primary">${item.price.toFixed(2)}</span>
                      <p className={`text-xxs font-bold mt-0.5 ${item.changePercent >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
                        {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
                <Star className="w-8 h-8 text-text-muted mb-2" />
                <p className="text-xs text-text-secondary">Your watchlist is empty.</p>
                <Link to="/market" className="text-xs font-semibold text-brand-500 hover:text-brand-400 mt-2">Find Stocks</Link>
              </div>
            )}
          </GlassCard>

          {/* Leaderboard Card */}
          <GlassCard className="h-full flex flex-col" hover={false}>
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-bold text-text-primary font-display">Leaderboard</h2>
              </div>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
              {data?.leaderboard?.map((leader) => (
                <div
                  key={leader.name}
                  className={`flex items-center justify-between p-2.5 rounded-2xl transition-all ${
                    leader.isCurrentUser
                      ? 'bg-brand-500/10 border border-brand-500/35 shadow-sm shadow-brand-900/5'
                      : 'bg-surface-sunken/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-bold w-4.5 ${
                      leader.rank === 1 ? 'text-amber-400' : leader.rank === 2 ? 'text-text-secondary' : leader.rank === 3 ? 'text-amber-600' : 'text-text-muted'
                    }`}>
                      #{leader.rank}
                    </span>
                    <img src={leader.avatar} alt={leader.name} className="w-7 h-7 rounded-full bg-surface-sunken border border-border-subtle" />
                    <div>
                      <span className={`text-xs font-bold ${leader.isCurrentUser ? 'text-brand-500' : 'text-text-primary'}`}>
                        {leader.name} {leader.isCurrentUser && '(You)'}
                      </span>
                      <div className="flex items-center space-x-1 mt-0.5 text-xxs text-text-muted font-medium">
                        <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                        <span>{leader.streak} Days</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-text-primary font-display">
                    ${leader.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recent Trades Card */}
          <GlassCard className="h-full flex flex-col" hover={false}>
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-bold text-text-primary font-display">Recent Trades</h2>
              </div>
              <Link to="/transactions" className="text-xs font-bold text-brand-500 hover:text-brand-400">History</Link>
            </div>

            {data?.recentTransactions?.length > 0 ? (
              <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
                {data.recentTransactions.map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between text-xs p-1">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-text-primary">{tx.stockSymbol}</span>
                        <Badge tone={tx.type === 'BUY' ? 'success' : 'danger'}>{tx.type}</Badge>
                      </div>
                      <span className="text-xxs text-text-muted font-semibold">{new Date(tx.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-text-primary">${tx.totalAmount.toFixed(2)}</span>
                      <p className="text-xxs text-text-muted font-medium mt-0.5">{tx.quantity} Shares @ ${tx.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
                <History className="w-8 h-8 text-text-muted mb-2" />
                <p className="text-xs text-text-secondary">No recent transactions.</p>
                <Link to="/market" className="text-xs font-semibold text-brand-500 hover:text-brand-400 mt-2">Trade Now</Link>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
