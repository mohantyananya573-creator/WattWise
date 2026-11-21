import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { FirebaseStatusBanner } from '../ui/FirebaseStatusBanner';

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      {/* Firebase Status & Configuration Notification Banner */}
      <FirebaseStatusBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />

        {/* Content Shell */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Mobile Navigation Header */}
          <MobileNav />

          {/* Main Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
