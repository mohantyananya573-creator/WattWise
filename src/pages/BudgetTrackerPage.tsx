import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import {
  Wallet,
  Pencil,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export const BudgetTrackerPage: React.FC = () => {
  const {
    budgetSettings,
    updateBudget,
    currentBillResult,
    monthlyRecords,
  } = useData();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState(budgetSettings.monthlyBudget);
  const [thresholdApproaching, setThresholdApproaching] = useState(
    budgetSettings.warningThresholds.approaching
  );
  const [thresholdNearLimit, setThresholdNearLimit] = useState(
    budgetSettings.warningThresholds.nearLimit
  );
  const [thresholdExceeded, setThresholdExceeded] = useState(
    budgetSettings.warningThresholds.exceeded
  );
  const [isSaving, setIsSaving] = useState(false);

  const budget = budgetSettings.monthlyBudget;
  const projected = currentBillResult.totalEstimatedBill;
  const remaining = Math.max(0, budget - projected);
  const overspend = Math.max(0, projected - budget);
  const percentage = budget > 0 ? (projected / budget) * 100 : 0;

  // Determine status
  let status: 'normal' | 'approaching' | 'nearLimit' | 'exceeded' = 'normal';
  if (percentage >= budgetSettings.warningThresholds.exceeded) {
    status = 'exceeded';
  } else if (percentage >= budgetSettings.warningThresholds.nearLimit) {
    status = 'nearLimit';
  } else if (percentage >= budgetSettings.warningThresholds.approaching) {
    status = 'approaching';
  }

  // Chart data: Compare monthly historical bills against budget line
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const chartData = [
    ...monthlyRecords
      .slice(0, 5)
      .reverse()
      .map((r) => ({
        month: r.monthName.split(' ')[0],
        bill: r.estimatedBill,
        budget: r.monthlyBudget,
      })),
    {
      month: `${currentDate.split(' ')[0]} (Cur)`,
      bill: projected,
      budget: budget,
    },
  ];

  const handleSaveBudgetSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateBudget({
        ...budgetSettings,
        monthlyBudget: Number(newBudget),
        warningThresholds: {
          approaching: Number(thresholdApproaching),
          nearLimit: Number(thresholdNearLimit),
          exceeded: Number(thresholdExceeded),
        },
        updatedAt: new Date().toISOString(),
      });
      setIsEditModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
            Electricity Budget Tracker
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Set spending targets, configure warning triggers, and track billing velocity.
          </p>
        </div>

        <Button
          onClick={() => {
            setNewBudget(budgetSettings.monthlyBudget);
            setThresholdApproaching(budgetSettings.warningThresholds.approaching);
            setThresholdNearLimit(budgetSettings.warningThresholds.nearLimit);
            setThresholdExceeded(budgetSettings.warningThresholds.exceeded);
            setIsEditModalOpen(true);
          }}
          leftIcon={<Pencil className="w-4 h-4" />}
        >
          Configure Budget
        </Button>
      </div>

      {/* Warning Alert if near or exceeding budget */}
      {status === 'exceeded' && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold">Monthly Budget Exceeded</h4>
            <p>
              Your projected electricity bill of {formatCurrency(projected)} exceeds your monthly budget of {formatCurrency(budget)} by {formatCurrency(overspend)}. Review high-consumption appliances in the Recommendations tab.
            </p>
          </div>
        </div>
      )}

      {status === 'nearLimit' && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold">Approaching Budget Limit</h4>
            <p>
              Your projected spending has reached {percentage.toFixed(1)}% of your monthly allowance. Only {formatCurrency(remaining)} remains.
            </p>
          </div>
        </div>
      )}

      {/* Core Budget Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 space-y-2" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Monthly Budget Target
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-light text-brand-primary flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-brand-dark">
            {formatCurrency(budget)}
          </div>
          <p className="text-xs text-brand-muted">Target maximum household spend</p>
        </Card>

        <Card className="p-5 space-y-2" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Projected Monthly Bill
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-800">
            {formatCurrency(projected)}
          </div>
          <p className="text-xs text-brand-muted">Simulated progressive charges</p>
        </Card>

        <Card className="p-5 space-y-2" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Remaining Budget
            </span>
            {remaining > 0 ? (
              <CheckCircle2 className="w-4 h-4 text-brand-primary" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className="text-3xl font-extrabold text-brand-dark">
            {remaining > 0 ? formatCurrency(remaining) : `-${formatCurrency(overspend)}`}
          </div>
          <p className="text-xs text-brand-muted">
            {remaining > 0 ? 'Available buffer' : 'Over budget amount'}
          </p>
        </Card>

        <Card className="p-5 space-y-2" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Budget Utilization
            </span>
            <Badge
              variant={
                status === 'exceeded' ? 'danger' : status === 'nearLimit' ? 'warning' : 'success'
              }
              size="sm"
            >
              {status === 'exceeded'
                ? 'Exceeded'
                : status === 'nearLimit'
                ? 'Near Limit'
                : status === 'approaching'
                ? 'Approaching'
                : 'Normal'}
            </Badge>
          </div>
          <div className="text-3xl font-extrabold text-brand-dark">
            {percentage.toFixed(1)}%
          </div>
          <p className="text-xs text-brand-muted">Of monthly financial ceiling</p>
        </Card>
      </div>

      {/* Progress Bar Component */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-brand-dark uppercase tracking-wider">
            Spending Progress vs Thresholds
          </span>
          <span className="font-semibold text-brand-muted">
            {formatCurrency(projected)} of {formatCurrency(budget)} used
          </span>
        </div>

        <div className="w-full bg-brand-pale rounded-full h-4 overflow-hidden border border-brand-border p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              status === 'exceeded'
                ? 'bg-red-500'
                : status === 'nearLimit'
                ? 'bg-amber-500'
                : 'bg-brand-primary'
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>

        <div className="grid grid-cols-4 text-center text-[11px] text-brand-muted pt-1">
          <div>
            <span className="font-semibold text-brand-primary block">Normal</span>
            <span>&lt; {budgetSettings.warningThresholds.approaching}%</span>
          </div>
          <div>
            <span className="font-semibold text-amber-600 block">Approaching</span>
            <span>{budgetSettings.warningThresholds.approaching}% – {budgetSettings.warningThresholds.nearLimit}%</span>
          </div>
          <div>
            <span className="font-semibold text-orange-600 block">Near Limit</span>
            <span>{budgetSettings.warningThresholds.nearLimit}% – {budgetSettings.warningThresholds.exceeded}%</span>
          </div>
          <div>
            <span className="font-semibold text-red-600 block">Exceeded</span>
            <span>&gt; {budgetSettings.warningThresholds.exceeded}%</span>
          </div>
        </div>
      </Card>

      {/* Historical Bill vs Budget Comparison Chart */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-brand-dark">
              Monthly Spending vs Budget Ceiling
            </h3>
            <p className="text-xs text-brand-muted">
              Track how your actual bills compare to your target financial cap
            </p>
          </div>
          <Badge variant="neutral">Target: {formatCurrency(budget)}</Badge>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1EAE3" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64746B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64746B' }} />
              <Tooltip
                formatter={(val: any) => [`₹${val}`, 'Amount']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  borderColor: '#E1EAE3',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine y={budget} stroke="#DC5555" strokeDasharray="4 4" label={{ value: 'Budget', fill: '#DC5555', fontSize: 10 }} />
              <Bar dataKey="bill" fill="#16845B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Edit Budget Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Configure Monthly Electricity Budget"
        description="Set your monthly financial limit and customize alert trigger thresholds."
        maxWidth="md"
      >
        <form onSubmit={handleSaveBudgetSettings} className="space-y-4">
          <Input
            label="Monthly Budget Ceiling (₹)"
            type="number"
            min={100}
            step={50}
            value={newBudget}
            onChange={(e) => setNewBudget(Number(e.target.value))}
            required
          />

          <div className="space-y-3 bg-brand-pale p-3.5 rounded-xl border border-brand-border">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-dark block">
              Warning Alert Thresholds (% of Budget)
            </span>

            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Approaching (%)"
                type="number"
                min={50}
                max={85}
                value={thresholdApproaching}
                onChange={(e) => setThresholdApproaching(Number(e.target.value))}
                required
              />
              <Input
                label="Near Limit (%)"
                type="number"
                min={75}
                max={99}
                value={thresholdNearLimit}
                onChange={(e) => setThresholdNearLimit(Number(e.target.value))}
                required
              />
              <Input
                label="Exceeded (%)"
                type="number"
                min={100}
                max={120}
                value={thresholdExceeded}
                onChange={(e) => setThresholdExceeded(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save Budget Settings
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
