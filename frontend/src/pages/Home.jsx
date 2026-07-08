import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  ShieldCheck,
  Award,
  ChevronDown,
  Flame,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import Logo from '../components/Logo';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border-subtle pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left py-3 focus:outline-none"
      >
        <span className="text-base font-bold text-text-primary">{question}</span>
        <ChevronDown className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-text-secondary leading-relaxed mt-2 pr-4">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PREVIEW_HOLDINGS = [
  { symbol: 'AAPL', price: 191.24, change: 1.85 },
  { symbol: 'MSFT', price: 393.52, change: 1.48 },
  { symbol: 'TSLA', price: 192.89, change: -2.14 }
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Virtual Cash Balance',
      desc: 'Start with $100,000 in simulated currency. Refine trading strategies and manage risk with no real money down.',
      icon: Briefcase
    },
    {
      title: 'Real-time Market Feeds',
      desc: 'Analyze and trade major US stocks with real-time quote feeds, details, and interactive charting widgets.',
      icon: TrendingUp
    },
    {
      title: 'Gamification Streaks',
      desc: 'Build habits and claim rewards. Daily logins keep your active trading streak alive and unlock badges.',
      icon: Flame
    },
    {
      title: 'Competitive Leaderboards',
      desc: 'Climb the ranks and compete against other paper traders. Showcase your performance and profitability metrics.',
      icon: Award
    }
  ];

  const advantages = [
    { label: 'Risk-Free Environment', text: 'Experiment with options, momentum trading, or long-term growth stocks without burning capital.' },
    { label: 'Comprehensive Analytics', text: 'Explore holding allocations, growth curves, and detailed trade histories on elegant charting tools.' },
    { label: 'Admin Management Cache', text: 'Ensures database integrity and cash adjustments to maximize training environments.' }
  ];

  const faqs = [
    { question: 'What is SB Stocks?', answer: 'SB Stocks is a risk-free paper trading platform built for learning stock trading. Users start with a virtual balance of $100,000 and trade US stocks using real-time mock data.' },
    { question: 'Is it completely free?', answer: 'Yes! The platform is 100% free to use. All financial indicators and trades are fully simulated, meaning you never use real money.' },
    { question: 'How is the virtual portfolio value calculated?', answer: 'Your total portfolio net worth is calculated dynamically as the sum of your cash balance plus the current market valuation of your active stock positions.' },
    { question: 'Can I reset my balance?', answer: 'Administrators can adjust user cash balances and wipe caches on the admin panel to facilitate custom scenarios.' }
  ];

  return (
    <div className="min-h-screen bg-surface-canvas text-text-primary bg-grid-pattern relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-canvas/80 backdrop-blur-md border-b border-border-subtle h-16 flex items-center justify-between px-6 md:px-12">
        <Logo to="/" size="sm" />

        <div>
          {isAuthenticated ? (
            <Link to="/dashboard" className="rgb-glow px-5 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors">
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="rgb-glow px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-32 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-raised border border-border-subtle text-xs font-semibold text-text-secondary mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
          <span>Live simulated market data</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold text-text-primary font-display tracking-tight max-w-4xl leading-tight"
        >
          Master the stock market with <span className="text-brand-600">virtual capital</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-text-secondary max-w-2xl mt-6 leading-relaxed"
        >
          Practice trading popular US stocks using real-time market valuations and virtual capital. Zero risk. Full feedback. Experience trading like a professional.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link to={isAuthenticated ? '/dashboard' : '/register'} className="rgb-glow px-8 py-4 text-base font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-2xl transition-colors">
            Start Trading Now
          </Link>
          <a href="#features" className="px-8 py-4 text-base font-semibold bg-surface-raised border border-border-subtle hover:bg-surface-sunken text-text-secondary rounded-2xl transition-all">
            Explore Features
          </a>
        </motion.div>

        {/* Product Preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 w-full max-w-4xl rounded-3xl border border-border-subtle shadow-elevation-3 bg-surface-raised text-left overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border-subtle">
            <div className="w-2.5 h-2.5 rounded-full bg-border-default"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-border-default"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-border-default"></div>
            <span className="text-xxs font-semibold text-text-muted uppercase tracking-widest mx-auto pr-16">Dashboard preview</span>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat chips */}
            <div className="md:col-span-1 space-y-3">
              <div className="p-4 rounded-2xl bg-surface-sunken border border-border-subtle">
                <p className="text-xxs font-semibold uppercase tracking-wider text-text-muted">Net Worth</p>
                <p className="text-xl font-extrabold text-text-primary font-display mt-1">$104,281.50</p>
                <p className="text-xs font-bold text-success-500 mt-1">+4.28% today</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-sunken border border-border-subtle">
                <p className="text-xxs font-semibold uppercase tracking-wider text-text-muted">Buying Power</p>
                <p className="text-xl font-extrabold text-text-primary font-display mt-1">$41,930.00</p>
              </div>
            </div>

            {/* Simple line chart */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-surface-sunken border border-border-subtle flex flex-col">
              <p className="text-xxs font-semibold uppercase tracking-wider text-text-muted mb-3">Portfolio growth · 7 days</p>
              <svg viewBox="0 0 300 90" className="w-full h-24" preserveAspectRatio="none">
                <polyline
                  points="0,70 40,60 80,64 120,45 160,50 200,28 240,34 300,12"
                  fill="none"
                  stroke="var(--color-success-500)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-3 space-y-1.5">
                {PREVIEW_HOLDINGS.map((h) => (
                  <div key={h.symbol} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text-primary">{h.symbol}</span>
                    <span className="font-semibold text-text-secondary tabular-nums">${h.price.toFixed(2)}</span>
                    <Badge tone={h.change >= 0 ? 'success' : 'danger'}>
                      {h.change >= 0 ? '+' : ''}{h.change.toFixed(2)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-border-subtle">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-text-primary font-display">Simulate, Learn, and Compete</h2>
          <p className="text-text-secondary mt-4 leading-relaxed text-sm">Everything you need to practice investing. Built with realistic transaction models and robust interfaces.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card h-full p-8 flex items-start gap-6 hover:border-border-default transition-colors"
              >
                <div className="p-4 rounded-2xl bg-brand-500/10 text-brand-600 border border-brand-500/20 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary font-display">{feature.title}</h3>
                  <p className="text-sm text-text-secondary mt-2.5 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Advantages / Why Paper Trade Section */}
      <section className="bg-surface-sunken/40 py-20 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-stretch">
          <div>
            <h2 className="text-3xl font-extrabold text-text-primary font-display leading-tight">
              Why use Paper Trading instead of real currency?
            </h2>
            <p className="text-text-secondary mt-5 leading-relaxed text-sm">
              Making decisions under pressure is hard. Practicing on simulated software builds confidence, solidifies charting strategies, and prevents costly beginner mistakes.
            </p>

            <div className="mt-8 space-y-6">
              {advantages.map((adv, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center shrink-0 border border-brand-500/25 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">{adv.label}</h4>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{adv.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-border-subtle shadow-elevation-2 h-[380px] lg:h-full min-h-[380px]">
            <img
              src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80"
              alt="Stock market trading charts on a screen"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/0 to-transparent"></div>

            <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:w-72 bg-surface-raised/95 backdrop-blur-md border border-border-subtle rounded-2xl px-5 py-4 shadow-elevation-3">
              <p className="text-xxs font-bold uppercase tracking-widest text-text-muted">Starting balance</p>
              <p className="text-3xl font-extrabold text-text-primary font-display mt-1">$100,000</p>
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border-subtle">
                <div>
                  <p className="text-sm font-extrabold text-success-500 font-display">0%</p>
                  <p className="text-xxs text-text-muted font-semibold mt-0.5">Real risk</p>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-text-primary font-display">Live</p>
                  <p className="text-xxs text-text-muted font-semibold mt-0.5">Quote data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border-subtle">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-text-primary font-display">User Testimonials</h2>
          <p className="text-text-secondary mt-4 leading-relaxed text-sm">Join thousands of students and retail investors practicing daily.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {[
            { name: 'Sarah Jenkins', role: 'Beginner Investor', seed: 'Sarah', text: 'This app is incredible. The $100k balance gave me the confidence to test and understand how stock values update. Best UI out there.' },
            { name: 'David Carter', role: 'Finance Student', seed: 'David', text: 'Using SB Stocks to test momentum algorithms. The fallback simulator is super responsive and replicates real-world conditions perfectly.' },
            { name: 'Li Wei', role: 'Casual Trader', seed: 'Wei', text: 'The streak gamification is a great touch. Keeps me logging in every morning to check the gainers/losers list and make paper trades.' }
          ].map((testi, i) => (
            <div key={i} className="card h-full p-6 hover:border-border-default transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${testi.seed}`}
                  alt={testi.name}
                  className="w-9 h-9 rounded-full bg-surface-sunken border border-border-default"
                />
                <div>
                  <h4 className="text-xs font-bold text-text-primary">{testi.name}</h4>
                  <p className="text-xxs text-text-muted font-semibold">{testi.role}</p>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed italic">"{testi.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-border-subtle">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-text-primary font-display">Frequently Asked Questions</h2>
          <p className="text-text-secondary mt-4 leading-relaxed text-sm">Have questions about trading logic? Find quick answers below.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-canvas border-t border-border-subtle py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo to="/" size="sm" ring={false} />

          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} SB Stocks. Built for educational virtual paper trading demonstration purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
