import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Award, 
  Users, 
  HelpCircle, 
  ChevronDown, 
  Flame, 
  Briefcase, 
  Star,
  Layers,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-800 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left py-3 focus:outline-none"
      >
        <span className="text-base font-bold text-slate-100">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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
            <p className="text-sm text-slate-400 leading-relaxed mt-2 pr-4">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Virtual Cash Balance',
      desc: 'Start with $100,000 in simulated currency. Refine trading strategies and manage risk with no real money down.',
      icon: Briefcase,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      title: 'Real-time Market Feeds',
      desc: 'Analyze and trade major US stocks with real-time quote feeds, details, and interactive charting widgets.',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Gamification Streaks',
      desc: 'Build habits and claim rewards. Daily logins keep your active trading streak alive and unlock badges.',
      icon: Flame,
      color: 'from-orange-500 to-amber-600'
    },
    {
      title: 'Competitive Leaderboards',
      desc: 'Climb the ranks and compete against other paper traders. Showcase your performance and profitability metrics.',
      icon: Award,
      color: 'from-purple-500 to-pink-600'
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
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-grid-pattern relative">
      {/* Background glow animations */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 h-16 flex items-center justify-between px-6 md:px-12">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-display">
            SB <span className="text-indigo-400">Stocks</span>
          </span>
        </Link>

        <div>
          {isAuthenticated ? (
            <Link to="/dashboard" className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/15 transition-all">
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/15 transition-all">
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
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300 mb-6"
        >
          <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
          <span>Real-time Paper Trading Simulator</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold text-slate-100 font-display tracking-tight max-w-4xl leading-tight"
        >
          Master the stock market with <span className="text-gradient-primary">Virtual Millions</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-400 max-w-2xl mt-6 leading-relaxed"
        >
          Practice trading popular US stocks using real-time market valuations and virtual capital. Zero risk. Full feedback. Experience trading like a professional.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link to={isAuthenticated ? '/dashboard' : '/register'} className="px-8 py-4 text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl shadow-indigo-600/25 hover:opacity-95 transition-opacity">
            Start Trading Now
          </Link>
          <a href="#features" className="px-8 py-4 text-base font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-2xl transition-all">
            Explore Features
          </a>
        </motion.div>

        {/* Mock Interface Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 w-full max-w-4xl p-2.5 rounded-3xl bg-slate-900/50 border border-slate-800/80 shadow-2xl backdrop-blur-sm relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-purple-500/0 to-pink-500/5 rounded-3xl pointer-events-none"></div>
          <div className="flex items-center space-x-2 px-3 pb-3 border-b border-slate-800/60">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <div className="w-20"></div>
            <div className="text-xxs font-semibold text-slate-600 uppercase tracking-widest mx-auto pr-16">SB STOCKS DEMO VIEW</div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80"
            alt="App Preview"
            className="w-full h-80 md:h-[420px] object-cover rounded-2xl opacity-85"
          />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-100 font-display">Simulate, Learn, and Compete</h2>
          <p className="text-slate-400 mt-4 leading-relaxed text-sm">Everything you need to practice investing. Built with realistic transaction models and robust interfaces.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-panel p-8 rounded-3xl flex items-start gap-6 border-slate-800/80 hover:border-slate-700/80 transition-all"
              >
                <div className={`p-4 rounded-2xl bg-gradient-to-tr ${feature.color} text-white shrink-0 shadow-lg shadow-indigo-950/20`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 font-display">{feature.title}</h3>
                  <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Advantages / Why Paper Trade Section */}
      <section className="bg-slate-950/40 py-20 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-100 font-display leading-tight">
              Why use Paper Trading instead of real currency?
            </h2>
            <p className="text-slate-400 mt-5 leading-relaxed text-sm">
              Making decisions under pressure is hard. Practicing on simulated software builds confidence, solidifies charting strategies, and prevents costly beginner mistakes.
            </p>

            <div className="mt-8 space-y-6">
              {advantages.map((adv, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/25 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{adv.label}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{adv.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-slate-800 max-h-[380px]">
            <img
              src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80"
              alt="Trading Charts"
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-100 font-display">User Testimonials</h2>
          <p className="text-slate-400 mt-4 leading-relaxed text-sm">Join thousands of students and retail investors practicing daily.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Sarah Jenkins', role: 'Beginner Investor', text: 'This app is incredible. The $100k balance gave me the confidence to test and understand how stock values update. Best UI out there.' },
            { name: 'David Carter', role: 'Finance Student', text: 'Using SB Stocks to test momentum algorithms. The fallback simulator is super responsive and replicates real-world conditions perfectly.' },
            { name: 'Li Wei', role: 'Casual Trader', text: 'The streak gamification is a great touch. Keeps me logging in every morning to check the gainers/losers list and make paper trades.' }
          ].map((testi, i) => (
            <div key={i} className="glass-panel p-6 rounded-3xl border-slate-800/80 hover:border-indigo-500/20 transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 font-bold text-indigo-400">
                  {testi.name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{testi.name}</h4>
                  <p className="text-xxs text-slate-500 font-semibold">{testi.role}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">"{testi.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-100 font-display">Frequently Asked Questions</h2>
          <p className="text-slate-400 mt-4 leading-relaxed text-sm">Have questions about trading logic? Find quick answers below.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white font-display">
              SB <span className="text-indigo-400">Stocks</span>
            </span>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SB Stocks. Built for educational virtual paper trading demonstration purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
