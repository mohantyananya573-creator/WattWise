import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Appliance, ApplianceCategory } from '../../types';
import { APPLIANCE_PRESETS } from '../../utils/presets';
import { Sparkles, Sliders } from 'lucide-react';

const applianceSchema = z.object({
  applianceName: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.enum([
    'Cooling',
    'Lighting',
    'Kitchen',
    'Entertainment',
    'Washing and Cleaning',
    'Heating',
    'Other',
  ] as const),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  wattage: z.number().min(1, 'Rated power must be greater than 0 W'),
  hoursPerDay: z.number().min(0.1, 'Hours must be greater than 0').max(24, 'Maximum 24 hours per day'),
  usageDaysPerMonth: z.number().int().min(1, 'Must be at least 1 day').max(31, 'Maximum 31 days per month'),
  averagePowerAdjustment: z.number().min(0.1).max(1.0).default(1.0),
});

type ApplianceFormData = z.infer<typeof applianceSchema>;

interface ApplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplianceFormData) => Promise<void>;
  initialData?: Appliance | null;
}

export const ApplianceModal: React.FC<ApplianceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ApplianceFormData>({
    resolver: zodResolver(applianceSchema),
    defaultValues: {
      applianceName: '',
      category: 'Cooling',
      quantity: 1,
      wattage: 75,
      hoursPerDay: 8,
      usageDaysPerMonth: 30,
      averagePowerAdjustment: 1.0,
    },
  });

  const selectedCategory = watch('category');
  const watchedHours = watch('hoursPerDay');
  const watchedDays = watch('usageDaysPerMonth');
  const watchedWatts = watch('wattage');
  const watchedQty = watch('quantity');
  const watchedAdjustment = watch('averagePowerAdjustment') || 1.0;

  // Real-time calculation preview in modal
  const previewKwh = Math.round(((watchedWatts * watchedQty * watchedHours * watchedDays * watchedAdjustment) / 1000) * 10) / 10;

  useEffect(() => {
    if (initialData) {
      reset({
        applianceName: initialData.applianceName,
        category: initialData.category,
        quantity: initialData.quantity,
        wattage: initialData.wattage,
        hoursPerDay: initialData.hoursPerDay,
        usageDaysPerMonth: initialData.usageDaysPerMonth,
        averagePowerAdjustment: initialData.averagePowerAdjustment ?? 1.0,
      });
    } else {
      reset({
        applianceName: '',
        category: 'Cooling',
        quantity: 1,
        wattage: 75,
        hoursPerDay: 8,
        usageDaysPerMonth: 30,
        averagePowerAdjustment: 1.0,
      });
    }
  }, [initialData, reset, isOpen]);

  const handlePresetSelect = (presetName: string) => {
    const preset = APPLIANCE_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setValue('applianceName', preset.name, { shouldValidate: true });
      setValue('category', preset.category, { shouldValidate: true });
      setValue('wattage', preset.defaultWattage, { shouldValidate: true });
      setValue('hoursPerDay', preset.typicalDailyHours, { shouldValidate: true });
      setValue('usageDaysPerMonth', preset.typicalDaysPerMonth, { shouldValidate: true });
      if (preset.hasDutyCycleAdjustment && preset.defaultDutyCycle) {
        setValue('averagePowerAdjustment', preset.defaultDutyCycle, { shouldValidate: true });
      } else {
        setValue('averagePowerAdjustment', 1.0, { shouldValidate: true });
      }
    }
  };

  const handleFormSubmit = async (data: ApplianceFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Household Appliance' : 'Add New Appliance'}
      description="Specify appliance wattage, runtime and quantity to track electricity consumption."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Preset Selector */}
        {!initialData && (
          <div className="bg-brand-pale p-3 rounded-xl border border-brand-border space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-dark">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              <span>Quick Presets (Click to autofill)</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {APPLIANCE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset.name)}
                  className="text-[11px] px-2.5 py-1 bg-white hover:bg-brand-light hover:text-brand-primary text-brand-text border border-brand-border rounded-lg transition-colors font-medium shadow-2xs"
                >
                  {preset.name} ({preset.defaultWattage}W)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Appliance Name */}
        <Input
          label="Appliance Name"
          placeholder="e.g. Master Bedroom Inverter AC"
          error={errors.applianceName?.message}
          {...register('applianceName')}
        />

        {/* Category & Quantity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            error={errors.category?.message}
            {...register('category')}
          >
            <option value="Cooling">Cooling</option>
            <option value="Lighting">Lighting</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Washing and Cleaning">Washing and Cleaning</option>
            <option value="Heating">Heating</option>
            <option value="Other">Other</option>
          </Select>

          <Input
            label="Quantity"
            type="number"
            min={1}
            error={errors.quantity?.message}
            {...register('quantity', { valueAsNumber: true })}
          />
        </div>

        {/* Wattage & Daily Hours Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Rated Power (Watts)"
            type="number"
            min={1}
            helperText="Check manufacturer label on appliance"
            error={errors.wattage?.message}
            {...register('wattage', { valueAsNumber: true })}
          />

          <Input
            label="Daily Usage (Hours/Day)"
            type="number"
            step="0.5"
            min={0.1}
            max={24}
            error={errors.hoursPerDay?.message}
            {...register('hoursPerDay', { valueAsNumber: true })}
          />
        </div>

        {/* Days Per Month & Duty Cycle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Usage Days Per Month"
            type="number"
            min={1}
            max={31}
            error={errors.usageDaysPerMonth?.message}
            {...register('usageDaysPerMonth', { valueAsNumber: true })}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted flex items-center gap-1">
                <Sliders className="w-3 h-3" />
                Duty Cycle / Load Factor
              </label>
              <span className="text-xs font-bold text-brand-dark">
                {Math.round(watchedAdjustment * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              className="w-full accent-brand-primary h-2 bg-brand-border rounded-lg cursor-pointer"
              {...register('averagePowerAdjustment', { valueAsNumber: true })}
            />
            <p className="text-[10px] text-brand-muted">
              Use ~60% for refrigerators, 80% for inverter ACs, 100% for standard resistive loads.
            </p>
          </div>
        </div>

        {/* Real-time Calculation Preview */}
        <div className="p-3 bg-brand-light rounded-xl border border-brand-primary/20 flex items-center justify-between text-xs">
          <div>
            <span className="text-brand-muted">Estimated Monthly Consumption:</span>
            <div className="font-bold text-sm text-brand-dark">{previewKwh} kWh/month</div>
          </div>
          <div className="text-right">
            <span className="text-brand-muted">Active Duty Cycle:</span>
            <div className="font-semibold text-brand-primary">{Math.round(watchedAdjustment * 100)}%</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialData ? 'Save Changes' : 'Add Appliance'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
