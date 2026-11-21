import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { TariffConfigModal } from '../components/bill/TariffConfigModal';
import { formatCurrency, formatKwh } from '../utils/formatters';
import {
  Calculator,
  Settings,
  Save,
  RotateCcw,
  Zap,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export const BillCalculatorPage: React.FC = () => {
  const {
    appliances,
    tariffSettings,
    totalHouseholdKwh,
    currentBillResult,
    updateTariff,
    saveCurrentMonthRecord,
  } = useData();

  // Current calculation period dates
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [periodStart, setPeriodStart] = useState<string>(firstDayOfMonth);
  const [periodEnd, setPeriodEnd] = useState<string>(lastDayOfMonth);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveRecord = async () => {
    setIsSaving(true);
    try {
      await saveCurrentMonthRecord(periodStart, periodEnd);
    } catch (err: any) {
      // toast is already emitted inside context, but catch here to stop loading
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPeriod = () => {
    setPeriodStart(firstDayOfMonth);
    setPeriodEnd(lastDayOfMonth);
    toast.info('Calculation dates reset to current calendar month.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
            Electricity Bill Predictor
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Simulate and predict your electricity bill using appliance loads and progressive slab tariffs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTariffModalOpen(true)}
            leftIcon={<Settings className="w-4 h-4 text-brand-primary" />}
          >
            Configure Tariff
          </Button>
          <Button
            size="sm"
            onClick={handleSaveRecord}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Monthly Record
          </Button>
        </div>
      </div>

      {/* Bill Period & Provider Banner */}
      <Card className="p-5 border-brand-border bg-white shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-brand-muted uppercase tracking-wider">
                Distribution Provider:
              </span>
              <span className="font-bold text-brand-dark bg-brand-pale px-3 py-1 rounded-lg border border-brand-border">
                {tariffSettings.provider}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-brand-muted uppercase tracking-wider">
                Category:
              </span>
              <Badge variant="neutral">{tariffSettings.consumerCategory}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-brand-muted uppercase tracking-wider">
                Model:
              </span>
              <Badge variant="info">
                {tariffSettings.tariffType === 'slab' ? 'Progressive Slabs' : 'Flat Rate'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-muted" />
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="border border-brand-border rounded-lg px-2 py-1 text-xs text-brand-text bg-white"
              />
              <span className="text-brand-muted">to</span>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="border border-brand-border rounded-lg px-2 py-1 text-xs text-brand-text bg-white"
              />
            </div>
            <button
              onClick={handleResetPeriod}
              title="Reset Period"
              className="p-1 text-brand-muted hover:text-brand-dark rounded-lg hover:bg-brand-pale"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Bill Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Estimated Bill Highlight Card */}
        <Card className="p-6 bg-gradient-to-br from-white to-brand-pale/40 border-brand-border flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                Estimated Electricity Bill
              </span>
              <div className="w-8 h-8 rounded-lg bg-brand-light text-brand-primary flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
            </div>
            <div className="text-4xl font-extrabold text-emerald-800">
              {formatCurrency(currentBillResult.totalEstimatedBill)}
            </div>
            <p className="text-xs text-brand-muted">
              Effective rate:{' '}
              <strong className="text-brand-dark">
                ₹{currentBillResult.effectiveRatePerKwh}/kWh
              </strong>{' '}
              across total consumption
            </p>
          </div>

          {/* Quick Stats list */}
          <div className="space-y-2.5 pt-4 border-t border-brand-border text-xs">
            <div className="flex justify-between">
              <span className="text-brand-muted">Total Electricity Units:</span>
              <span className="font-bold text-brand-dark">
                {formatKwh(currentBillResult.totalKwh)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Active Appliances:</span>
              <span className="font-bold text-brand-dark">
                {appliances.length} configured
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Calculation Method:</span>
              <span className="font-bold text-brand-primary">
                {tariffSettings.tariffType === 'slab' ? 'Tiers (Progressive)' : 'Single Flat Rate'}
              </span>
            </div>
          </div>

          <Button
            size="md"
            className="w-full"
            onClick={handleSaveRecord}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Calculation Snapshot
          </Button>
        </Card>

        {/* Detailed Cost Breakdown Table */}
        <Card className="lg:col-span-2 p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-brand-dark">Itemized Cost Breakdown</h3>
            <p className="text-xs text-brand-muted">
              Precise monetary charges based on configured tariff slabs and statutory dues
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted font-bold uppercase tracking-wider">
                  <th className="py-2.5">Component</th>
                  <th className="py-2.5">Basis / Rate</th>
                  <th className="py-2.5 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                <tr>
                  <td className="py-3 font-semibold text-brand-dark">Energy Charges</td>
                  <td className="py-3 text-brand-muted">
                    {tariffSettings.tariffType === 'slab'
                      ? `${tariffSettings.slabConfiguration.length} Tiered progressive slabs`
                      : `Flat ₹${tariffSettings.flatRate}/kWh`}
                  </td>
                  <td className="py-3 text-right font-bold text-brand-dark">
                    {formatCurrency(currentBillResult.energyCharges)}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-semibold text-brand-dark">Fixed Meter / Demand Charge</td>
                  <td className="py-3 text-brand-muted">Monthly connected load charge</td>
                  <td className="py-3 text-right font-bold text-brand-dark">
                    {formatCurrency(currentBillResult.fixedCharge)}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-semibold text-brand-dark">Electricity Duty & Surcharges</td>
                  <td className="py-3 text-brand-muted">
                    {tariffSettings.otherChargesType === 'percentage'
                      ? `${tariffSettings.otherCharges}% statutory duty`
                      : `Fixed ₹${tariffSettings.otherCharges}`}
                  </td>
                  <td className="py-3 text-right font-bold text-brand-dark">
                    {formatCurrency(currentBillResult.otherCharges)}
                  </td>
                </tr>

                {currentBillResult.credits > 0 && (
                  <tr>
                    <td className="py-3 font-semibold text-brand-primary">Government Subsidy / Credit</td>
                    <td className="py-3 text-brand-muted">State energy rebate applied</td>
                    <td className="py-3 text-right font-bold text-brand-primary">
                      -{formatCurrency(currentBillResult.credits)}
                    </td>
                  </tr>
                )}

                <tr className="bg-brand-pale/80 font-bold text-sm">
                  <td className="py-3.5 px-3 rounded-l-xl text-brand-dark">Total Estimated Bill</td>
                  <td className="py-3.5 text-brand-muted">Rounded to nearest rupee</td>
                  <td className="py-3.5 px-3 rounded-r-xl text-right text-emerald-800 text-base">
                    {formatCurrency(currentBillResult.totalEstimatedBill)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Progressive Slab Consumption Table */}
      {tariffSettings.tariffType === 'slab' && currentBillResult.slabBreakdown.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-primary" />
            <div>
              <h3 className="text-base font-bold text-brand-dark">
                Progressive Slab Calculation Breakdown
              </h3>
              <p className="text-xs text-brand-muted">
                Each portion of consumption billed strictly at its respective tier rate
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentBillResult.slabBreakdown.map((slab, idx) => (
              <div
                key={idx}
                className="p-4 bg-brand-pale rounded-xl border border-brand-border space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-dark">Slab Tier {idx + 1}</span>
                  <Badge variant="neutral">
                    {slab.to !== null ? `${slab.from} - ${slab.to} units` : `Above ${slab.from} units`}
                  </Badge>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Units Billed:</span>
                  <span className="font-semibold text-brand-dark">{slab.unitsBilled} kWh</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Tier Rate:</span>
                  <span className="font-semibold text-brand-dark">₹{slab.rate.toFixed(2)}/kWh</span>
                </div>
                <div className="pt-2 border-t border-brand-border flex justify-between font-bold">
                  <span>Tier Total:</span>
                  <span className="text-brand-primary">{formatCurrency(slab.cost)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Required Disclaimer Banner */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Estimation Disclaimer</h4>
          <p className="mt-0.5 leading-relaxed">
            This is an estimated electricity bill based on your appliance usage and configured tariff. It is not an official utility bill.
          </p>
        </div>
      </div>

      {/* Tariff Settings Modal */}
      <TariffConfigModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
        tariffSettings={tariffSettings}
        onSave={async (newSettings) => {
          await updateTariff(newSettings);
        }}
      />
    </div>
  );
};
