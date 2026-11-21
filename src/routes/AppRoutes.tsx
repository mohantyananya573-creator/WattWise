import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AppliancesPage } from '../pages/AppliancesPage';
import { BillCalculatorPage } from '../pages/BillCalculatorPage';
import { ConsumptionAnalysisPage } from '../pages/ConsumptionAnalysisPage';
import { CarbonFootprintPage } from '../pages/CarbonFootprintPage';
import { MonthlyHistoryPage } from '../pages/MonthlyHistoryPage';
import { EnergyTipsPage } from '../pages/EnergyTipsPage';
import { BudgetTrackerPage } from '../pages/BudgetTrackerPage';
import { SettingsPage } from '../pages/SettingsPage';
import { Zap } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white animate-bounce shadow-md">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Loading WattWise…
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Authenticated Dashboard Pages */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/appliances" element={<AppliancesPage />} />
        <Route path="/bill-calculator" element={<BillCalculatorPage />} />
        <Route path="/consumption-analysis" element={<ConsumptionAnalysisPage />} />
        <Route path="/carbon-footprint" element={<CarbonFootprintPage />} />
        <Route path="/history" element={<MonthlyHistoryPage />} />
        <Route path="/energy-tips" element={<EnergyTipsPage />} />
        <Route path="/budget-tracker" element={<BudgetTrackerPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
