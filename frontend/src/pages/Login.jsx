import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import Logo from '../components/Logo';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toast.success('Successfully logged in!');
      navigate(redirectPath, { replace: true });
    } else {
      toast.error(res.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-text-primary flex items-center justify-center bg-grid-pattern relative px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <Logo to="/" size="lg" className="justify-center" />
          <h2 className="text-lg font-bold text-text-secondary font-display mt-6">Welcome Back</h2>
          <p className="text-xs text-text-muted mt-1">Sign in to check portfolio values and execute trades</p>
        </div>

        {/* Card containing login form */}
        <GlassCard className="p-8 border-border-subtle" hover={false}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-surface-sunken border border-border-default rounded-xl text-text-primary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 text-sm font-medium"
                  required
                />
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-text-muted" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-surface-sunken border border-border-default rounded-xl text-text-primary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 text-sm font-medium"
                  required
                />
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-text-muted" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="rgb-glow w-full h-12 bg-brand-600 hover:bg-brand-500 disabled:bg-surface-sunken disabled:text-text-muted text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/10 flex items-center justify-center space-x-2 transition-all mt-4"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </GlassCard>

        {/* Redirect toggle */}
        <p className="text-center text-xs text-text-muted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-500 hover:text-brand-400">
            Sign Up Now
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
