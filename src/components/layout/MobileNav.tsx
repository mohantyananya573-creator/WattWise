import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Tv,
  Calculator,
  PieChart,
  Leaf,
  History,
  Lightbulb,
  Wallet,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

export const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userProfile, currentUser, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Appliances', path: '/appliances', icon: Tv },
    { name: 'Bill Calculator', path: '/bill-calculator', icon: Calculator },
    { name: 'Consumption Analysis', path: '/consumption-analysis', icon: PieChart },
    { name: 'Carbon Footprint', path: '/carbon-footprint', icon: Leaf },
    { name: 'Monthly History', path: '/history', icon: History },
    { name: 'Energy Saving Tips', path: '/energy-tips', icon: Lightbulb },
    { name: 'Budget Tracker', path: '/budget-tracker', icon: Wallet },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white border-b border-brand-border">
      {/* Top Mobile Bar */}
      <div className="flex items-center justify-between px-4 h-16">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-sm">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span className="text-lg font-bold text-brand-dark">
            Watt<span className="text-brand-primary">Wise</span>
          </span>
        </NavLink>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl text-brand-dark hover:bg-brand-pale transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-brand-dark/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-white shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
                  <Zap className="w-4 h-4 fill-white" />
                </div>
                <span className="font-bold text-brand-dark">WattWise</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-brand-muted hover:bg-brand-pale"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-brand-light text-brand-primary font-semibold'
                          : 'text-brand-muted hover:text-brand-dark hover:bg-brand-pale'
                      )
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* User & Logout */}
            <div className="pt-4 border-t border-brand-border space-y-3">
              <div className="flex items-center gap-2.5 px-2">
                <div className="w-8 h-8 rounded-full bg-brand-light text-brand-primary flex items-center justify-center font-bold text-xs">
                  {userProfile?.fullName?.[0]?.toUpperCase() || 'W'}
                </div>
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-bold text-brand-dark truncate">
                    {userProfile?.fullName || currentUser?.displayName || 'User'}
                  </div>
                  <div className="text-[10px] text-brand-muted truncate">
                    {userProfile?.email || currentUser?.email}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
