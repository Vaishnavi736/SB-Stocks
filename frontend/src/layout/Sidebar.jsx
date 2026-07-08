import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  History,
  Star,
  ShieldAlert,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Shared with DashboardLayout's content padding and floating toggle handle so every
// piece of the layout that reacts to the sidebar moves in perfect lockstep.
export const SIDEBAR_TRANSITION = { duration: 0.3, ease: [0.4, 0, 0.2, 1] };
export const SIDEBAR_WIDTH_OPEN = '10%';
export const SIDEBAR_WIDTH_CLOSED = '0%';

const Sidebar = ({ isOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Market', to: '/market', icon: TrendingUp },
    { name: 'Portfolio', to: '/portfolio', icon: Briefcase },
    { name: 'Watchlist', to: '/watchlist', icon: Star },
    { name: 'Transactions', to: '/transactions', icon: History },
  ];

  if (user?.isAdmin) {
    navigation.push({ name: 'Admin Console', to: '/admin', icon: ShieldAlert });
  }

  return (
    <motion.aside
      animate={{ width: isOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED }}
      transition={SIDEBAR_TRANSITION}
      className="fixed top-[6.25rem] bottom-0 left-0 z-20 min-w-0 overflow-hidden bg-surface-raised border-r border-border-subtle"
    >
      {/* Inner content fades independently (fast) so text never squashes/reflows while
          the outer rail is still animating its width — it disappears almost immediately
          on close and only appears once the rail has mostly finished expanding on open. */}
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.15, delay: isOpen ? 0.15 : 0 }}
        className="h-full w-56 flex flex-col"
      >
        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
            return (
              <NavLink
                key={item.name}
                to={item.to}
                tabIndex={isOpen ? 0 : -1}
                className={`relative flex items-center px-4 py-3 rounded-xl transition-colors duration-200 ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 font-medium'
                    : 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="rgb-ring absolute inset-0 bg-brand-500/10 border border-brand-500/20 border-l-2 border-l-brand-500 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="w-5 h-5 min-w-5 shrink-0 relative z-10" />
                <span className="ml-4 text-sm relative z-10 whitespace-nowrap">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-border-subtle">
          <button
            onClick={logout}
            tabIndex={isOpen ? 0 : -1}
            className="flex items-center w-full px-4 py-3 text-text-secondary rounded-xl hover:bg-danger-500/10 hover:text-danger-500 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="ml-4 text-sm whitespace-nowrap">Sign Out</span>
          </button>
        </div>
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;
