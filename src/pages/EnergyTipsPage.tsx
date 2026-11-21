import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Appliance, EnergySavingRecommendation } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SavingsSimulatorModal } from '../components/recommendations/SavingsSimulatorModal';
import { formatCurrency, formatKwh, formatCo2 } from '../utils/formatters';
import {
  Lightbulb,
  Sparkles,
  Sliders,
  DollarSign,
  Leaf,
  Zap,
  ArrowRight,
  TrendingDown,
  Wind,
  CheckCircle2,
  Tv,
} from 'lucide-react';

export const EnergyTipsPage: React.FC = () => {
  const {
    appliances,
    recommendations,
    currentBillResult,
    totalHouseholdKwh,
    selectedEmissionsFactor,
    editAppliance,
  } = useData();

  const [simulatorAppliance, setSimulatorAppliance] = useState<Appliance | null>(null);

  const avgRate =
    totalHouseholdKwh > 0
      ? currentBillResult.totalEstimatedBill / totalHouseholdKwh
      : 5.0;

  // Aggregate potential savings if all recommendations are implemented
  const totalPotentialKwh = Math.round(
    recommendations.reduce((sum, r) => sum + r.potentialSavingsKwh, 0) * 10
  ) / 10;
  const totalPotentialCost = Math.round(
    recommendations.reduce((sum, r) => sum + r.potentialSavingsCost, 0) * 100
  ) / 100;
  const totalPotentialCo2 = Math.round(
    recommendations.reduce((sum, r) => sum + r.potentialCo2AvoidedKg, 0) * 10
  ) / 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
          Energy Saving Recommendations
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Rule-based efficiency insights tailored to your household appliance load profile.
        </p>
      </div>

      {/* Aggregate Savings Potential Banner */}
      <Card className="p-6 bg-gradient-to-r from-brand-pale via-white to-brand-light/40 border-brand-primary/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">
                Maximum Household Savings Potential
              </h3>
              <p className="text-xs text-brand-muted">
                Estimated monthly reductions achievable by adopting these recommendations
              </p>
            </div>
          </div>

          <Badge variant="success" size="md">
            Efficiency Opportunities
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-brand-border">
          <div className="p-3.5 bg-white rounded-xl border border-brand-border text-center">
            <span className="text-[11px] font-semibold text-brand-muted uppercase">
              Potential Units Saved
            </span>
            <div className="text-xl font-extrabold text-brand-dark mt-0.5">
              {formatKwh(totalPotentialKwh)}
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase">
              Potential Monthly Savings
            </span>
            <div className="text-xl font-extrabold text-emerald-800 mt-0.5">
              {formatCurrency(totalPotentialCost)}
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-brand-border text-center">
            <span className="text-[11px] font-semibold text-brand-muted uppercase">
              Avoided Carbon Emissions
            </span>
            <div className="text-xl font-extrabold text-brand-dark mt-0.5">
              {formatCo2(totalPotentialCo2)}
            </div>
          </div>
        </div>
      </Card>

      {/* Interactive Savings Simulator Launcher Banner */}
      <Card className="p-5 bg-white border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-light text-brand-primary flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-dark">
              Interactive Energy Savings Simulator
            </h4>
            <p className="text-xs text-brand-muted">
              Select any household appliance and drag the runtime slider to model instant financial & carbon savings.
            </p>
          </div>
        </div>

        {appliances.length > 0 && (
          <div className="w-full sm:w-auto">
            <select
              onChange={(e) => {
                const app = appliances.find((a) => a.id === e.target.value);
                if (app) setSimulatorAppliance(app);
              }}
              defaultValue=""
              className="text-xs font-semibold border border-brand-border rounded-xl px-3 py-2 bg-white text-brand-dark hover:border-brand-primary cursor-pointer w-full"
            >
              <option value="" disabled>
                Select Appliance to Simulate…
              </option>
              {appliances.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.applianceName} ({app.hoursPerDay} hrs/day)
                </option>
              ))}
            </select>
          </div>
        )}
      </Card>

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-brand-dark">
            Tailored Energy Reduction Actions ({recommendations.length})
          </h3>
          <span className="text-xs text-brand-muted">Ranked by potential impact</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendations.map((rec) => {
            const relevantApp = appliances.find((a) =>
              rec.applianceName.toLowerCase().includes(a.applianceName.toLowerCase())
            );

            return (
              <Card
                key={rec.id}
                hoverEffect
                className="p-6 space-y-4 flex flex-col justify-between border-brand-border"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-light text-brand-primary flex items-center justify-center shrink-0">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <Badge
                        variant={
                          rec.priority === 'High'
                            ? 'danger'
                            : rec.priority === 'Medium'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {rec.priority} Priority
                      </Badge>
                    </div>

                    <span className="text-[11px] font-semibold text-brand-muted bg-brand-pale px-2.5 py-1 rounded-full border border-brand-border">
                      {rec.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-brand-dark text-base">{rec.title}</h4>
                    <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                      {rec.reason}
                    </p>
                  </div>

                  {/* Suggested Action Box */}
                  <div className="p-3 bg-brand-pale rounded-xl border border-brand-border text-xs space-y-1">
                    <span className="font-bold text-brand-dark flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                      Recommended Action:
                    </span>
                    <p className="text-brand-text leading-relaxed pl-4">
                      {rec.suggestedAction}
                    </p>
                  </div>
                </div>

                {/* Footer with potential metrics & simulator trigger */}
                <div className="pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-brand-muted block text-[10px] uppercase font-semibold">
                      Estimated Monthly Benefit
                    </span>
                    <span className="font-extrabold text-emerald-800 text-sm">
                      Save {formatCurrency(rec.potentialSavingsCost)}
                    </span>
                    <span className="text-brand-muted text-[11px] block">
                      ({formatKwh(rec.potentialSavingsKwh)} • {formatCo2(rec.potentialCo2AvoidedKg)})
                    </span>
                  </div>

                  {relevantApp && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSimulatorAppliance(relevantApp)}
                      leftIcon={<Sliders className="w-3.5 h-3.5 text-brand-primary" />}
                    >
                      Simulate
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Simulator Modal */}
      {simulatorAppliance && (
        <SavingsSimulatorModal
          isOpen={Boolean(simulatorAppliance)}
          onClose={() => setSimulatorAppliance(null)}
          appliance={simulatorAppliance}
          avgUnitRate={avgRate}
          emissionsFactor={selectedEmissionsFactor.factorValue}
          onApplyChanges={async (id, newHours) => {
            await editAppliance(id, { hoursPerDay: newHours });
          }}
        />
      )}
    </div>
  );
};
