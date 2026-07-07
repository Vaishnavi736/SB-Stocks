import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  DollarSign, 
  TrendingUp, 
  Award, 
  ArrowUpRight, 
  Flame, 
  History, 
  Star,
  Users,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import StockChart from '../components/StockChart';
import LoadingSkeleton from '../components/LoadingSkeleton';

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

  // Formatted stats
  const totalValueStr = `$${portfolio.totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const balanceStr = `$${portfolio.virtualBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const investmentStr = `$${portfolio.totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const holdingsValueStr = `$${portfolio.holdingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const todayProfit = portfolio.unrealizedGainLoss;
  const todayProfitPct = portfolio.unrealizedGainLossPct;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 font-display">Welcome Back, {user?.name}!</h1>
            <p className="text-xs text-slate-400 mt-1">Practice trading risk-free. Stock prices update in real-time.</p>
          </div>
          {portfolio.rank && (
            <div className="inline-flex items-center space-x-2 bg-indigo-950/40 border border-indigo-500/20 px-4 py-2 rounded-2xl">
              <Award className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold text-slate-300">
                Leaderboard Rank: <span className="text-indigo-400">#{portfolio.rank}</span>
              </span>
            </div>
          )}
        </div>

        {/* Statistic Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Net Worth"
            value={totalValueStr}
            change={todayProfit}
            changePercent={todayProfitPct}
            icon={TrendingUp}
            glow={true}
          />
          <StatCard
            title="Buying Power"
            value={balanceStr}
            icon={DollarSign}
            description="Available cash for trades"
          />
          <StatCard
            title="Total Investments"
            value={investmentStr}
            icon={Briefcase}
            description="Virtual cash deployed in stock"
          />
          <StatCard
            title="Current Positions Value"
            value={holdingsValueStr}
            icon={ArrowUpRight}
            description="Total live valuation of holdings"
          />
        </div>

        {/* Growth Chart & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Card */}
          <GlassCard className="lg:col-span-2 flex flex-col justify-between" hover={false}>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display">Account Growth</h2>
              <p className="text-xxs font-semibold text-slate-500 uppercase tracking-wider mt-1">Portfolio growth over last 7 days</p>
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
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-100 font-display">Market Movers</h2>
                <Link to="/market" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">View All</Link>
              </div>

              {/* Tab Selector */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 mt-4 text-xs font-bold">
                {['trending', 'gainers', 'losers'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveMoverTab(tab)}
                    className={`flex-1 py-1.5 text-center capitalize rounded-lg transition-all ${
                      activeMoverTab === tab
                        ? 'bg-slate-850 text-slate-100 border border-slate-800'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Movers List */}
              <div className="mt-4 space-y-3.5">
                {(data?.marketMovers?.[activeMoverTab] || []).slice(0, 4).map((stock) => (
                  <Link 
                    to={`/stocks/${stock.symbol}`} 
                    key={stock.symbol}
                    className="flex items-center justify-between p-2 hover:bg-slate-800/40 rounded-xl transition-all"
                  >
                    <div>
                      <span className="font-bold text-slate-200 text-sm">{stock.symbol}</span>
                      <p className="text-xxs text-slate-500 font-medium truncate max-w-28 sm:max-w-40">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-200">${stock.price.toFixed(2)}</span>
                      <p className={`text-xxs font-bold mt-0.5 ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Watchlist & Leaderboard & Transactions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Watchlist Card */}
          <GlassCard className="flex flex-col" hover={false}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                <h2 className="text-lg font-bold text-slate-100 font-display">Watchlist</h2>
              </div>
              <Link to="/watchlist" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Manage</Link>
            </div>

            {data?.watchlist?.length > 0 ? (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
                {data.watchlist.map((item) => (
                  <Link 
                    key={item.symbol} 
                    to={`/stocks/${item.symbol}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/30 border border-slate-800/50 hover:bg-slate-850 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-200">{item.symbol}</span>
                      <p className="text-xxs text-slate-500 font-medium truncate max-w-28">{item.companyName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-200">${item.price.toFixed(2)}</span>
                      <p className={`text-xxs font-bold mt-0.5 ${item.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
                <Star className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-xs text-slate-500">Your watchlist is empty.</p>
                <Link to="/market" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 mt-2">Find Stocks</Link>
              </div>
            )}
          </GlassCard>

          {/* Leaderboard Card */}
          <GlassCard className="flex flex-col" hover={false}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-100 font-display">Leaderboard</h2>
              </div>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
              {data?.leaderboard?.map((leader) => (
                <div 
                  key={leader.name}
                  className={`flex items-center justify-between p-2.5 rounded-2xl transition-all ${
                    leader.isCurrentUser 
                      ? 'bg-indigo-950/20 border border-indigo-500/35 shadow-sm shadow-indigo-900/5' 
                      : 'bg-slate-900/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-bold w-4.5 ${
                      leader.rank === 1 ? 'text-amber-400' : leader.rank === 2 ? 'text-slate-400' : leader.rank === 3 ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      #{leader.rank}
                    </span>
                    <img src={leader.avatar} alt={leader.name} className="w-7 h-7 rounded-full bg-slate-850 border border-slate-800" />
                    <div>
                      <span className={`text-xs font-bold ${leader.isCurrentUser ? 'text-indigo-400' : 'text-slate-200'}`}>
                        {leader.name} {leader.isCurrentUser && '(You)'}
                      </span>
                      <div className="flex items-center space-x-1 mt-0.5 text-xxs text-slate-500 font-medium">
                        <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                        <span>{leader.streak} Days</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-200 font-display">
                    ${leader.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recent Trades Card */}
          <GlassCard className="flex flex-col" hover={false}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-100 font-display">Recent Trades</h2>
              </div>
              <Link to="/transactions" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">History</Link>
            </div>

            {data?.recentTransactions?.length > 0 ? (
              <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
                {data.recentTransactions.map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between text-xs p-1">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-200">{tx.stockSymbol}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xxs font-bold ${
                          tx.type === 'BUY' 
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' 
                            : 'bg-rose-950/40 text-rose-400 border border-rose-500/10'
                        }`}>
                          {tx.type}
                        </span>
                      </div>
                      <span className="text-xxs text-slate-500 font-semibold">{new Date(tx.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-200">${tx.totalAmount.toFixed(2)}</span>
                      <p className="text-xxs text-slate-500 font-medium mt-0.5">{tx.quantity} Shares @ ${tx.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
                <History className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-xs text-slate-500">No recent transactions.</p>
                <Link to="/market" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 mt-2">Trade Now</Link>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
