import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase, 
  History, 
  Star, 
  ShieldAlert, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

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
    <aside 
      className={`fixed top-16 bottom-0 left-0 z-30 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
        isOpen ? 'w-55' : 'w-20'
      }`}
    >
      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-5 h-5 min-w-5 shrink-0" />
              <span className={`ml-4 text-sm transition-opacity duration-200 whitespace-nowrap ${
                isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
              }`}>
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Toggle & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-slate-400 rounded-xl hover:bg-red-950/40 hover:text-red-400 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className={`ml-4 text-sm whitespace-nowrap transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
          }`}>
            Sign Out
          </span>
        </button>

        <button
          onClick={toggleSidebar}
          className="hidden md:flex items-center justify-center w-full py-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors duration-150"
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
