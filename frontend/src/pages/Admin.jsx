import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Users,
  History,
  Briefcase,
  DollarSign,
  Trash2,
  Edit3,
  ShieldCheck,
  X,
  Database
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Badge from '../components/Badge';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Balance modifier overlay state
  const [selectedUser, setSelectedUser] = useState(null);
  const [newBalance, setNewBalance] = useState('');
  const [updatingBalance, setUpdatingBalance] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsResponse, usersResponse] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users')
      ]);

      if (statsResponse.data && statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }
      if (usersResponse.data && usersResponse.data.success) {
        setUsers(usersResponse.data.users);
      }
    } catch (error) {
      console.error('Failed to load admin stats:', error.message);
      toast.error('Failed to load administration assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Update user virtual balance
  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    if (!selectedUser || isNaN(parseFloat(newBalance)) || parseFloat(newBalance) < 0) {
      toast.error('Please enter a valid cash balance amount');
      return;
    }

    setUpdatingBalance(true);
    try {
      const response = await axios.post(`/api/admin/users/${selectedUser._id}/balance`, {
        balance: parseFloat(newBalance)
      });

      if (response.data && response.data.success) {
        toast.success(response.data.message);
        setSelectedUser(null);
        setNewBalance('');
        // Reload details
        fetchAdminData();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update cash balance');
    } finally {
      setUpdatingBalance(false);
    }
  };

  // Delete user account cascading
  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete the account for ${name}? This action is irreversible and deletes all holdings and transaction records.`)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/admin/users/${userId}`);
      if (response.data && response.data.success) {
        toast.success(response.data.message);
        setUsers(prev => prev.filter(u => u._id !== userId));
        fetchAdminData();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete user account');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <LoadingSkeleton.Grid count={4} />
          <LoadingSkeleton.Card height="h-[360px]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/25 text-brand-500 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary font-display">Admin Console</h1>
            <p className="text-xs text-text-secondary mt-1">Global system logs, user balances, and cascade liquidations.</p>
          </div>
        </motion.div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Platform Users"
            value={stats?.totalUsers || 0}
            decimals={0}
            icon={Users}
            description="Active accounts registered"
          />
          <StatCard
            title="Total Operations Logged"
            value={stats?.totalTransactions || 0}
            decimals={0}
            icon={History}
            description="Paper trades executed"
          />
          <StatCard
            title="Total Holdings Positions"
            value={stats?.totalHoldings || 0}
            decimals={0}
            icon={Briefcase}
            description="Active DB portfolios entries"
          />
          <StatCard
            title="Avg User Net Worth"
            value={stats?.averagePortfolioVal || 0}
            prefix="$"
            decimals={0}
            icon={DollarSign}
            description="Mean user portfolio worth"
          />
        </div>

        {/* User Management Panel */}
        <GlassCard className="p-0 overflow-hidden border-border-subtle" hover={false}>
          <div className="p-6 border-b border-border-subtle flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary font-display">User Accounts</h2>
            <span className="text-xxs font-bold text-text-muted uppercase bg-surface-sunken border border-border-subtle px-3 py-1 rounded-full">
              {users.length} registered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-sunken text-text-muted border-b border-border-subtle text-xxs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Name / Avatar</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-right">Cash Balance</th>
                  <th className="px-6 py-4 text-right">Total Net Worth</th>
                  <th className="px-6 py-4 text-center">Streak</th>
                  <th className="px-6 py-4 text-center">Created At</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-sm font-semibold">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-surface-sunken/60 transition-colors">
                    {/* User profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img src={u.avatar} alt="avatar" className="w-7 h-7 rounded-full bg-surface-sunken border border-border-default" />
                        <div>
                          <span className="text-text-primary block text-xs">{u.name}</span>
                          {u.isAdmin && (
                            <Badge tone="brand" className="mt-0.5 tracking-widest">Admin</Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-6 py-4 text-xs text-text-secondary font-medium">{u.email}</td>
                    {/* Cash */}
                    <td className="px-6 py-4 text-right text-success-500 font-mono text-xs">
                      ${u.virtualBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    {/* Networth */}
                    <td className="px-6 py-4 text-right text-text-primary font-display font-bold">
                      ${u.totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    {/* Streak */}
                    <td className="px-6 py-4 text-center text-xs text-text-secondary">
                      {u.loginStreak} Day{u.loginStreak > 1 ? 's' : ''}
                    </td>
                    {/* Created */}
                    <td className="px-6 py-4 text-center text-xxs text-text-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    {/* Action buttons */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Edit Balance */}
                        <button
                          onClick={() => { setSelectedUser(u); setNewBalance(u.virtualBalance.toString()); }}
                          className="p-2 bg-surface-sunken border border-border-subtle text-text-secondary hover:text-brand-500 hover:border-brand-500/25 rounded-xl transition-all"
                          title="Adjust Balance"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-2 bg-surface-sunken border border-border-subtle text-text-muted hover:text-danger-500 hover:bg-danger-500/10 hover:border-danger-500/25 rounded-xl transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Balance modifier overlay modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-canvas/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm bg-surface-raised border border-border-subtle rounded-3xl p-6 shadow-elevation-3 relative"
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-text-primary font-display">Adjust cash balance</h3>
              <p className="text-xxs text-text-muted font-semibold mt-1">Configure buying power for user: {selectedUser.name}</p>

              <form onSubmit={handleUpdateBalance} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">New Balance ($)</label>
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full h-11 px-4 bg-surface-sunken border border-border-default rounded-xl text-text-primary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 font-medium"
                    placeholder="Enter cash balance amount"
                    min="0"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingBalance}
                  className="rgb-glow w-full h-11 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  {updatingBalance ? 'Updating...' : 'Save Balance'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Admin;
