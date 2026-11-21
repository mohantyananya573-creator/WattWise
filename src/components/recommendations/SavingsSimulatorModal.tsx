import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Appliance } from '../../types';
import { simulateSavings } from '../../utils/calculations';
import { formatCurrency, formatKwh, formatCo2 } from '../../utils/formatters';
import { Sliders, TrendingDown, DollarSign, Leaf, Zap, CheckCircle2 } from 'lucide-react';

interface SavingsSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  appliance: Appliance | null;
  avgUnitRate: number;
  emissionsFactor: number;
  onApplyChanges?: (applianceId: string, newHours: number) => Promise<void>;
}

export const SavingsSimulatorModal: React.FC<SavingsSimulatorModalProps> = ({
  isOpen,
  onClose,
  appliance,
  avgUnitRate,
  emissionsFactor,
  onApplyChanges,
}) => {
  if (!appliance) return null;

  const [simulatedHours, setSimulatedHours] = useState(
    Math.max(0.5, appliance.hoursPerDay - 2)
  );
  const [isApplying, setIsApplying] = useState(false);

  const simulation = simulateSavings(
    appliance,
    simulatedHours,
    avgUnitRate,
    emissionsFactor
  );

  const handleApply = async () => {
    if (!onApplyChanges) return;
    setIsApplying(true);
    try {
      await onApplyChanges(appliance.id, simulatedHours);
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Interactive Energy Savings Simulator"
      description="Simulate adjusting daily operating hours and evaluate potential cost & carbon reductions."
      maxWidth="lg"
    >
      <div className="space-y-5 text-sm">
        {/* Selected Appliance Info */}
        <div className="bg-brand-pale p-4 rounded-xl border border-brand-border flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Target Appliance
            </span>
            <h4 className="text-base font-bold text-brand-dark mt-0.5">
              {appliance.applianceName}
            </h4>
            <p className="text-xs text-brand-muted">
              {appliance.quantity} unit(s) • {appliance.wattage}W rated power
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-brand-muted">Current Daily Runtime</span>
            <div className="text-base font-bold text-brand-dark">
              {appliance.hoursPerDay} hrs/day
            </div>
          </div>
        </div>

        {/* Runtime Adjustment Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-brand-primary" />
              Simulate New Daily Runtime
            </label>
            <span className="text-base font-extrabold text-brand-primary bg-brand-light px-3 py-0.5 rounded-lg">
              {simulatedHours} hrs/day
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={24}
            step={0.5}
            value={simulatedHours}
            onChange={(e) => setSimulatedHours(Number(e.target.value))}
            className="w-full accent-brand-primary h-2 bg-brand-border rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-brand-muted">
            <span>0 hrs (Switched off)</span>
            <span>Current: {appliance.hoursPerDay} hrs</span>
            <span>24 hrs (Continuous)</span>
          </div>
        </div>

        {/* Projected Impact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-brand-light/60 rounded-xl border border-brand-primary/20 text-center">
            <div className="w-7 h-7 rounded-lg bg-brand-light flex items-center justify-center text-brand-primary mx-auto mb-1.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-semibold text-brand-muted">Electricity Saved</div>
            <div className="text-base font-extrabold text-brand-dark">
              {formatKwh(simulation.kwhSaved)}
            </div>
            <div className="text-[10px] text-brand-muted mt-0.5">
              {simulation.originalKwh} → {simulation.simulatedKwh} kWh
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 mx-auto mb-1.5">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-semibold text-emerald-800">Monthly Cost Saved</div>
            <div className="text-base font-extrabold text-emerald-800">
              {formatCurrency(simulation.moneySaved)}
            </div>
            <div className="text-[10px] text-emerald-700/80 mt-0.5">
              based on avg ₹{avgUnitRate.toFixed(2)}/kWh
            </div>
          </div>

          <div className="p-3.5 bg-brand-pale rounded-xl border border-brand-border text-center">
            <div className="w-7 h-7 rounded-lg bg-brand-light flex items-center justify-center text-brand-primary mx-auto mb-1.5">
              <Leaf className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-semibold text-brand-muted">Emissions Avoided</div>
            <div className="text-base font-extrabold text-brand-dark">
              {formatCo2(simulation.co2AvoidedKg)}
            </div>
            <div className="text-[10px] text-brand-muted mt-0.5">
              CO₂e greenhouse reduction
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="text-xs text-brand-muted italic">
          Simulated calculations are temporary. Clicking &quot;Apply to Appliance&quot; will permanently update this appliance&apos;s daily runtime in your profile.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-border">
          <Button variant="outline" onClick={onClose}>
            Close Simulation
          </Button>
          {onApplyChanges && (
            <Button
              onClick={handleApply}
              isLoading={isApplying}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Apply to Appliance
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
