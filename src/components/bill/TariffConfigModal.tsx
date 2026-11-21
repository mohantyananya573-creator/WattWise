import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { TariffSettings, TariffSlab } from '../../types';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { DEFAULT_TARIFF_SETTINGS, DEFAULT_TARIFF_SLABS } from '../../utils/calculations';

interface TariffConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariffSettings: TariffSettings;
  onSave: (settings: TariffSettings) => Promise<void>;
}

export const TariffConfigModal: React.FC<TariffConfigModalProps> = ({
  isOpen,
  onClose,
  tariffSettings,
  onSave,
}) => {
  const [provider, setProvider] = useState(tariffSettings.provider);
  const [consumerCategory, setConsumerCategory] = useState(tariffSettings.consumerCategory);
  const [tariffType, setTariffType] = useState<'slab' | 'flat'>(tariffSettings.tariffType);
  const [flatRate, setFlatRate] = useState(tariffSettings.flatRate || 5.0);
  const [fixedCharge, setFixedCharge] = useState(tariffSettings.fixedCharge || 50.0);
  const [otherCharges, setOtherCharges] = useState(tariffSettings.otherCharges || 5.0);
  const [otherChargesType, setOtherChargesType] = useState<'percentage' | 'fixed'>(
    tariffSettings.otherChargesType || 'percentage'
  );
  const [credits, setCredits] = useState(tariffSettings.creditsConfiguration || 0.0);
  const [slabs, setSlabs] = useState<TariffSlab[]>(tariffSettings.slabConfiguration || DEFAULT_TARIFF_SLABS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSlab = () => {
    const lastSlab = slabs[slabs.length - 1];
    const fromUnit = lastSlab ? (lastSlab.toUnit || lastSlab.fromUnit + 100) : 0;
    setSlabs([...slabs, { fromUnit, toUnit: fromUnit + 100, rate: 6.0 }]);
  };

  const handleRemoveSlab = (index: number) => {
    if (slabs.length <= 1) return;
    setSlabs(slabs.filter((_, i) => i !== index));
  };

  const handleUpdateSlab = (index: number, field: keyof TariffSlab, value: any) => {
    setSlabs(
      slabs.map((slab, i) => {
        if (i === index) {
          return { ...slab, [field]: value };
        }
        return slab;
      })
    );
  };

  const handleResetDefaults = () => {
    setProvider(DEFAULT_TARIFF_SETTINGS.provider);
    setConsumerCategory(DEFAULT_TARIFF_SETTINGS.consumerCategory);
    setTariffType('slab');
    setFixedCharge(DEFAULT_TARIFF_SETTINGS.fixedCharge);
    setOtherCharges(DEFAULT_TARIFF_SETTINGS.otherCharges);
    setOtherChargesType('percentage');
    setCredits(0);
    setSlabs(DEFAULT_TARIFF_SLABS);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated: TariffSettings = {
        ...tariffSettings,
        provider,
        consumerCategory,
        tariffType,
        flatRate: Number(flatRate),
        fixedCharge: Number(fixedCharge),
        otherCharges: Number(otherCharges),
        otherChargesType,
        creditsConfiguration: Number(credits),
        slabConfiguration: slabs.map((s) => ({
          fromUnit: Number(s.fromUnit),
          toUnit: s.toUnit !== null && s.toUnit !== undefined && s.toUnit !== ('' as any) ? Number(s.toUnit) : null,
          rate: Number(s.rate),
        })),
        updatedAt: new Date().toISOString(),
      };
      await onSave(updated);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Electricity Tariff"
      description="Customize tariff structure, progressive slabs, fixed monthly charges, and subsidies."
      maxWidth="xl"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Electricity Distribution Provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            required
          />
          <Input
            label="Consumer Category"
            value={consumerCategory}
            onChange={(e) => setConsumerCategory(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Billing Model"
            value={tariffType}
            onChange={(e) => setTariffType(e.target.value as any)}
          >
            <option value="slab">Progressive Slab Tariff (Standard)</option>
            <option value="flat">Flat Per-Unit Rate</option>
          </Select>

          {tariffType === 'flat' ? (
            <Input
              label="Flat Rate (₹ per kWh)"
              type="number"
              step="0.1"
              value={flatRate}
              onChange={(e) => setFlatRate(Number(e.target.value))}
              required
            />
          ) : (
            <div className="flex items-end pb-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetDefaults}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset Default Slabs
              </Button>
            </div>
          )}
        </div>

        {/* Progressive Slabs Configuration */}
        {tariffType === 'slab' && (
          <div className="space-y-2 bg-brand-pale p-3.5 rounded-xl border border-brand-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                Progressive Slabs (Tiers)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSlab}
                leftIcon={<Plus className="w-3.5 h-3.5 text-brand-primary" />}
              >
                Add Slab Tier
              </Button>
            </div>

            <div className="space-y-2 mt-2">
              {slabs.map((slab, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-brand-border text-xs"
                >
                  <span className="font-semibold text-brand-muted w-14 shrink-0">
                    Tier {index + 1}:
                  </span>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-brand-muted block">From (kWh)</span>
                      <input
                        type="number"
                        className="w-full border border-brand-border rounded px-2 py-1 text-xs"
                        value={slab.fromUnit}
                        onChange={(e) => handleUpdateSlab(index, 'fromUnit', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-muted block">To (kWh, or null)</span>
                      <input
                        type="number"
                        placeholder="No limit"
                        className="w-full border border-brand-border rounded px-2 py-1 text-xs"
                        value={slab.toUnit === null ? '' : slab.toUnit}
                        onChange={(e) =>
                          handleUpdateSlab(index, 'toUnit', e.target.value === '' ? null : Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-muted block">Rate (₹/kWh)</span>
                      <input
                        type="number"
                        step="0.05"
                        className="w-full border border-brand-border rounded px-2 py-1 text-xs font-semibold"
                        value={slab.rate}
                        onChange={(e) => handleUpdateSlab(index, 'rate', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  {slabs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlab(index)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-brand-muted italic mt-1">
              Note: Progressive slab billing charges each slice of consumption at its respective tier rate.
            </p>
          </div>
        )}

        {/* Fixed and Additional Charges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Fixed Meter Charge (₹)"
            type="number"
            step="1"
            value={fixedCharge}
            onChange={(e) => setFixedCharge(Number(e.target.value))}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Electricity Duty / Tax
            </label>
            <div className="flex gap-1.5">
              <input
                type="number"
                step="0.5"
                className="w-2/3 rounded-xl border border-brand-border px-3 py-2.5 text-sm"
                value={otherCharges}
                onChange={(e) => setOtherCharges(Number(e.target.value))}
              />
              <select
                className="w-1/3 rounded-xl border border-brand-border px-2 py-2.5 text-xs bg-white"
                value={otherChargesType}
                onChange={(e) => setOtherChargesType(e.target.value as any)}
              >
                <option value="percentage">%</option>
                <option value="fixed">₹</option>
              </select>
            </div>
          </div>

          <Input
            label="Government Credits / Subsidy (₹)"
            type="number"
            step="1"
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value))}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Tariff Configuration
          </Button>
        </div>
      </form>
    </Modal>
  );
};
