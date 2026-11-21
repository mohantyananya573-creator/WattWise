import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  Appliance,
  BudgetSettings,
  EmissionsFactor,
  MonthlyRecord,
  TariffSettings,
  ApplianceSnapshot,
  EnergySavingRecommendation,
} from '../types';
import {
  getAppliances,
  addAppliance,
  updateAppliance,
  deleteAppliance,
  getTariffSettings,
  saveTariffSettings,
  getMonthlyRecords,
  saveMonthlyRecord,
  deleteMonthlyRecord,
  getBudgetSettings,
  saveBudgetSettings,
  getEmissionsFactors,
} from '../firebase/firestore';
import {
  calculateApplianceSnapshots,
  calculateBill,
  calculateCarbonEmissions,
  calculateTotalHouseholdKwh,
  DEFAULT_TARIFF_SETTINGS,
  generateRecommendations,
  BillCalculationResult,
} from '../utils/calculations';
import { DEFAULT_EMISSIONS_FACTOR, OFFICIAL_EMISSIONS_FACTORS } from '../utils/emissionsData';
import { toast } from 'sonner';

interface DataContextType {
  appliances: Appliance[];
  tariffSettings: TariffSettings;
  monthlyRecords: MonthlyRecord[];
  budgetSettings: BudgetSettings;
  emissionsFactors: EmissionsFactor[];
  selectedEmissionsFactor: EmissionsFactor;
  setSelectedEmissionsFactor: (factor: EmissionsFactor) => void;
  isLoading: boolean;
  error: string | null;

  // Real-time calculations from current appliances & tariff
  totalHouseholdKwh: number;
  currentBillResult: BillCalculationResult;
  currentCarbonEmissionsKg: number;
  applianceSnapshots: ApplianceSnapshot[];
  recommendations: EnergySavingRecommendation[];
  budgetComparison: {
    budget: number;
    projected: number;
    remaining: number;
    percentage: number;
    status: 'normal' | 'approaching' | 'nearLimit' | 'exceeded';
  };
  previousMonthComparison: {
    previousRecord: MonthlyRecord | null;
    kwhDiff: number;
    kwhPercent: number;
    costDiff: number;
    costPercent: number;
    carbonDiff: number;
    carbonPercent: number;
  };

  // Actions
  addNewAppliance: (data: Omit<Appliance, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editAppliance: (id: string, data: Partial<Appliance>) => Promise<void>;
  removeAppliance: (id: string) => Promise<void>;
  updateTariff: (settings: TariffSettings) => Promise<void>;
  saveCurrentMonthRecord: (periodStart: string, periodEnd: string, customBudget?: number) => Promise<MonthlyRecord>;
  removeRecord: (recordId: string) => Promise<void>;
  updateBudget: (budget: BudgetSettings) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [tariffSettings, setTariffSettings] = useState<TariffSettings>(DEFAULT_TARIFF_SETTINGS);
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([]);
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>({
    id: 'current',
    userId: '',
    monthlyBudget: 2500,
    currency: '₹',
    warningThresholds: { approaching: 70, nearLimit: 90, exceeded: 100 },
    updatedAt: new Date().toISOString(),
  });
  const [emissionsFactors, setEmissionsFactors] = useState<EmissionsFactor[]>(OFFICIAL_EMISSIONS_FACTORS);
  const [selectedEmissionsFactor, setSelectedEmissionsFactor] = useState<EmissionsFactor>(DEFAULT_EMISSIONS_FACTOR);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [apps, tariff, records, budget, factors] = await Promise.all([
        getAppliances(userId),
        getTariffSettings(userId),
        getMonthlyRecords(userId),
        getBudgetSettings(userId),
        getEmissionsFactors(),
      ]);

      setAppliances(apps);
      setTariffSettings(tariff);
      setMonthlyRecords(records);
      setBudgetSettings(budget);
      if (factors && factors.length > 0) {
        setEmissionsFactors(factors);
        setSelectedEmissionsFactor(factors[0]);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Unable to load your data. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.uid) {
      loadData(currentUser.uid);
    } else {
      setAppliances([]);
      setMonthlyRecords([]);
      setIsLoading(false);
    }
  }, [currentUser?.uid]);

  // Computed values
  const totalHouseholdKwh = useMemo(() => {
    return calculateTotalHouseholdKwh(appliances);
  }, [appliances]);

  const currentBillResult = useMemo(() => {
    return calculateBill(totalHouseholdKwh, tariffSettings);
  }, [totalHouseholdKwh, tariffSettings]);

  const currentCarbonEmissionsKg = useMemo(() => {
    return calculateCarbonEmissions(totalHouseholdKwh, selectedEmissionsFactor.factorValue);
  }, [totalHouseholdKwh, selectedEmissionsFactor]);

  const applianceSnapshots = useMemo(() => {
    return calculateApplianceSnapshots(appliances, tariffSettings, selectedEmissionsFactor.factorValue);
  }, [appliances, tariffSettings, selectedEmissionsFactor]);

  const recommendations = useMemo(() => {
    return generateRecommendations(
      appliances,
      totalHouseholdKwh,
      currentBillResult.totalEstimatedBill,
      budgetSettings.monthlyBudget,
      tariffSettings,
      selectedEmissionsFactor.factorValue
    );
  }, [appliances, totalHouseholdKwh, currentBillResult, budgetSettings, tariffSettings, selectedEmissionsFactor]);

  const budgetComparison = useMemo(() => {
    const budget = budgetSettings.monthlyBudget || 2000;
    const projected = currentBillResult.totalEstimatedBill;
    const remaining = Math.max(0, budget - projected);
    const percentage = budget > 0 ? (projected / budget) * 100 : 0;

    let status: 'normal' | 'approaching' | 'nearLimit' | 'exceeded' = 'normal';
    if (percentage >= budgetSettings.warningThresholds.exceeded) {
      status = 'exceeded';
    } else if (percentage >= budgetSettings.warningThresholds.nearLimit) {
      status = 'nearLimit';
    } else if (percentage >= budgetSettings.warningThresholds.approaching) {
      status = 'approaching';
    }

    return {
      budget,
      projected,
      remaining,
      percentage: Math.round(percentage * 10) / 10,
      status,
    };
  }, [budgetSettings, currentBillResult]);

  const previousMonthComparison = useMemo(() => {
    if (!monthlyRecords || monthlyRecords.length === 0) {
      return {
        previousRecord: null,
        kwhDiff: 0,
        kwhPercent: 0,
        costDiff: 0,
        costPercent: 0,
        carbonDiff: 0,
        carbonPercent: 0,
      };
    }

    const previousRecord = monthlyRecords[0]; // Most recent saved record
    const kwhDiff = totalHouseholdKwh - previousRecord.totalKwh;
    const kwhPercent = previousRecord.totalKwh > 0 ? (kwhDiff / previousRecord.totalKwh) * 100 : 0;

    const costDiff = currentBillResult.totalEstimatedBill - previousRecord.estimatedBill;
    const costPercent = previousRecord.estimatedBill > 0 ? (costDiff / previousRecord.estimatedBill) * 100 : 0;

    const carbonDiff = currentCarbonEmissionsKg - previousRecord.carbonEmissionsKg;
    const carbonPercent = previousRecord.carbonEmissionsKg > 0 ? (carbonDiff / previousRecord.carbonEmissionsKg) * 100 : 0;

    return {
      previousRecord,
      kwhDiff: Math.round(kwhDiff * 10) / 10,
      kwhPercent: Math.round(kwhPercent * 10) / 10,
      costDiff: Math.round(costDiff * 100) / 100,
      costPercent: Math.round(costPercent * 10) / 10,
      carbonDiff: Math.round(carbonDiff * 10) / 10,
      carbonPercent: Math.round(carbonPercent * 10) / 10,
    };
  }, [monthlyRecords, totalHouseholdKwh, currentBillResult, currentCarbonEmissionsKg]);

  // Operations
  const addNewAppliance = async (data: Omit<Appliance, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;
    try {
      const created = await addAppliance(currentUser.uid, data);
      setAppliances((prev) => [created, ...prev]);
      toast.success(`${created.applianceName} added successfully!`);
    } catch (err: any) {
      toast.error('Failed to add appliance: ' + err?.message);
      throw err;
    }
  };

  const editAppliance = async (id: string, data: Partial<Appliance>) => {
    if (!currentUser) return;
    try {
      await updateAppliance(currentUser.uid, id, data);
      setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a)));
      toast.success('Appliance updated successfully.');
    } catch (err: any) {
      toast.error('Failed to update appliance: ' + err?.message);
      throw err;
    }
  };

  const removeAppliance = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteAppliance(currentUser.uid, id);
      setAppliances((prev) => prev.filter((a) => a.id !== id));
      toast.success('Appliance deleted.');
    } catch (err: any) {
      toast.error('Failed to delete appliance: ' + err?.message);
      throw err;
    }
  };

  const updateTariff = async (settings: TariffSettings) => {
    if (!currentUser) return;
    try {
      await saveTariffSettings(currentUser.uid, settings);
      setTariffSettings(settings);
      toast.success('Tariff configuration saved.');
    } catch (err: any) {
      toast.error('Failed to save tariff settings: ' + err?.message);
      throw err;
    }
  };

  const saveCurrentMonthRecord = async (periodStart: string, periodEnd: string, customBudget?: number) => {
    if (!currentUser) throw new Error('User not logged in');

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const startDate = new Date(periodStart);
    const monthName = `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;

    // Verify existing record to avoid accidental overwrite
    const existing = monthlyRecords.find((r) => r.periodStart === periodStart && r.periodEnd === periodEnd);
    if (existing) {
      throw new Error(`A record already exists for the period ${periodStart} to ${periodEnd}.`);
    }

    const recordData: Omit<MonthlyRecord, 'id' | 'userId' | 'createdAt'> = {
      periodStart,
      periodEnd,
      monthName,
      totalKwh: totalHouseholdKwh,
      estimatedBill: currentBillResult.totalEstimatedBill,
      energyCharges: currentBillResult.energyCharges,
      fixedCharge: currentBillResult.fixedCharge,
      otherCharges: currentBillResult.otherCharges,
      credits: currentBillResult.credits,
      monthlyBudget: customBudget || budgetSettings.monthlyBudget,
      carbonEmissionsKg: currentCarbonEmissionsKg,
      emissionsFactor: selectedEmissionsFactor.factorValue,
      emissionsFactorSource: selectedEmissionsFactor.sourceName,
      applianceSnapshots: applianceSnapshots,
    };

    try {
      const saved = await saveMonthlyRecord(currentUser.uid, recordData);
      setMonthlyRecords((prev) => [saved, ...prev]);
      toast.success(`Saved monthly record for ${monthName}!`);
      return saved;
    } catch (err: any) {
      toast.error('Failed to save monthly record: ' + err?.message);
      throw err;
    }
  };

  const removeRecord = async (recordId: string) => {
    if (!currentUser) return;
    try {
      await deleteMonthlyRecord(currentUser.uid, recordId);
      setMonthlyRecords((prev) => prev.filter((r) => r.id !== recordId));
      toast.success('Monthly record deleted.');
    } catch (err: any) {
      toast.error('Failed to delete monthly record: ' + err?.message);
      throw err;
    }
  };

  const updateBudget = async (budget: BudgetSettings) => {
    if (!currentUser) return;
    try {
      await saveBudgetSettings(currentUser.uid, budget);
      setBudgetSettings(budget);
      toast.success('Budget settings updated.');
    } catch (err: any) {
      toast.error('Failed to update budget: ' + err?.message);
      throw err;
    }
  };

  const refreshAllData = async () => {
    if (currentUser?.uid) {
      await loadData(currentUser.uid);
    }
  };

  return (
    <DataContext.Provider
      value={{
        appliances,
        tariffSettings,
        monthlyRecords,
        budgetSettings,
        emissionsFactors,
        selectedEmissionsFactor,
        setSelectedEmissionsFactor,
        isLoading,
        error,
        totalHouseholdKwh,
        currentBillResult,
        currentCarbonEmissionsKg,
        applianceSnapshots,
        recommendations,
        budgetComparison,
        previousMonthComparison,
        addNewAppliance,
        editAppliance,
        removeAppliance,
        updateTariff,
        saveCurrentMonthRecord,
        removeRecord,
        updateBudget,
        refreshAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
