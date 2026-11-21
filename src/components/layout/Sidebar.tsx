import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
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
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
}) => {
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

  return (
    <aside
      className={clsx(
        'hidden md:flex flex-col border-r border-brand-border bg-white transition-all duration-300 relative z-30',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top Header & Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-brand-border">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shrink-0 shadow-sm">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-brand-dark leading-tight">
                Watt<span className="text-brand-primary">Wise</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                Energy Manager
              </span>
            </div>
          )}
        </NavLink>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-dark hover:bg-brand-pale transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group select-none',
                  isActive
                    ? 'bg-brand-light text-brand-primary font-semibold shadow-sm'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-brand-pale'
                )
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-brand-border space-y-2">
        <div
          className={clsx(
            'flex items-center gap-3 p-2 rounded-xl bg-brand-pale/70 border border-brand-border/60',
            collapsed ? 'justify-center' : 'justify-start'
          )}
        >
          <div className="w-9 h-9 rounded-full bg-brand-light text-brand-primary flex items-center justify-center font-bold text-sm shrink-0 border border-brand-primary/20">
            {userProfile?.fullName?.[0]?.toUpperCase() || currentUser?.displayName?.[0]?.toUpperCase() || 'W'}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-brand-dark truncate">
                {userProfile?.fullName || currentUser?.displayName || 'WattWise User'}
              </span>
              <span className="text-[11px] text-brand-muted truncate">
                {userProfile?.email || currentUser?.email || 'user@wattwise.org'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:text-red-700 hover:bg-red-50 transition-colors',
            collapsed ? 'justify-center' : 'justify-start'
          )}
          title={collapsed ? 'Log Out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0 text-red-500" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
