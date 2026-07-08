import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import Logo from '../components/Logo';

const AVATAR_SEEDS = ['Jack', 'Aria', 'Leo', 'Zoe', 'Ruby', 'Mason'];

const Register = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(AVATAR_SEEDS[0]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`;
    const res = await register(name, email, password, avatarUrl);
    setLoading(false);

    if (res.success) {
      toast.success('Account created successfully! Welcome to SB Stocks.');
      navigate('/dashboard');
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-text-primary flex items-center justify-center bg-grid-pattern relative px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md my-8"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <Logo to="/" size="lg" className="justify-center" />
          <h2 className="text-lg font-bold text-text-secondary font-display mt-6">Create Account</h2>
          <p className="text-xs text-text-muted mt-1">Get $100,000 virtual cash instantly to start paper trading</p>
        </div>

        {/* Card containing registration form */}
        <GlassCard className="p-8 border-border-subtle" hover={false}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Your Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-surface-sunken border border-border-default rounded-xl text-text-primary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 text-sm font-medium"
                  required
                />
                <UserIcon className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-text-muted" />
              </div>
            </div>

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
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="•••••••• (Min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-surface-sunken border border-border-default rounded-xl text-text-primary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 text-sm font-medium"
                  required
                />
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-text-muted" />
              </div>
            </div>

            {/* Interactive Avatar Selection */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Choose Avatar</label>
              <div className="flex items-center justify-between bg-surface-sunken p-3.5 rounded-2xl border border-border-subtle">
                <div className="flex space-x-2.5">
                  {AVATAR_SEEDS.map((seed) => (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => setAvatarSeed(seed)}
                      className={`w-8.5 h-8.5 rounded-full overflow-hidden border-2 transition-all shrink-0 ${
                        avatarSeed === seed ? 'border-brand-500 scale-105' : 'border-border-subtle opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`}
                        alt={seed}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                <div className="w-10 h-10 rounded-full border border-border-subtle bg-surface-raised overflow-hidden shrink-0">
                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`}
                    alt="Active Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="rgb-glow w-full h-12 bg-brand-600 hover:bg-brand-500 disabled:bg-surface-sunken disabled:text-text-muted text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/10 flex items-center justify-center space-x-2 transition-all mt-4"
            >
              <span>{loading ? 'Creating Account...' : 'Get Started'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </GlassCard>

        {/* Redirect toggle */}
        <p className="text-center text-xs text-text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-500 hover:text-brand-400">
            Sign In Instead
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
