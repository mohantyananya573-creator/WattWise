export type ApplianceCategory =
  | 'Cooling'
  | 'Lighting'
  | 'Kitchen'
  | 'Entertainment'
  | 'Washing and Cleaning'
  | 'Heating'
  | 'Other';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  location?: string;
  householdType?: 'Apartment' | 'Independent House' | 'Villa' | 'Other';
  householdMembers?: number;
  electricityProvider?: string;
  consumerCategory?: string;
  preferredBillingPeriod?: '1 Month' | '2 Months';
  monthlyBudget?: number;
  role?: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Appliance {
  id: string;
  userId: string;
  applianceName: string;
  category: ApplianceCategory;
  quantity: number;
  wattage: number; // in Watts
  hoursPerDay: number; // 0 - 24
  usageDaysPerMonth: number; // 1 - 31
  averagePowerAdjustment?: number; // 0.1 to 1.0 (default 1.0, e.g. 0.7 for compressor duty cycle)
  createdAt: string;
  updatedAt: string;
}

export interface TariffSlab {
  fromUnit: number;
  toUnit: number | null; // null for upper unbounded slab
  rate: number; // ₹ per unit (kWh)
}

export interface TariffSettings {
  id: string;
  userId: string;
  provider: string;
  consumerCategory: string;
  tariffType: 'slab' | 'flat';
  slabConfiguration: TariffSlab[];
  flatRate?: number;
  fixedCharge: number;
  otherCharges: number; // taxes / surcharges
  otherChargesType: 'percentage' | 'fixed';
  creditsConfiguration: number; // subsidies / credits
  currency: string; // "₹"
  updatedAt: string;
}

export interface ApplianceSnapshot {
  applianceId: string;
  applianceName: string;
  category: ApplianceCategory;
  wattage: number;
  quantity: number;
  hoursPerDay: number;
  usageDaysPerMonth: number;
  monthlyKwh: number;
  percentageShare: number;
  costEstimate: number;
  carbonKg: number;
}

export interface MonthlyRecord {
  id: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  monthName: string;
  totalKwh: number;
  estimatedBill: number;
  energyCharges: number;
  fixedCharge: number;
  otherCharges: number;
  credits: number;
  monthlyBudget: number;
  carbonEmissionsKg: number;
  emissionsFactor: number;
  emissionsFactorSource: string;
  applianceSnapshots: ApplianceSnapshot[];
  createdAt: string;
}

export interface BudgetSettings {
  id: string;
  userId: string;
  monthlyBudget: number;
  currency: string;
  warningThresholds: {
    approaching: number; // default 70%
    nearLimit: number;   // default 90%
    exceeded: number;    // default 100%
  };
  updatedAt: string;
}

export interface EmissionsFactor {
  id: string;
  region: string;
  factorValue: number; // kg CO2e / kWh
  unit: string;
  sourceName: string;
  sourceUrl: string;
  referenceYear: number;
  updatedAt: string;
  active: boolean;
}

export interface EnergySavingRecommendation {
  id: string;
  title: string;
  reason: string;
  applianceName: string;
  category: ApplianceCategory;
  suggestedAction: string;
  priority: 'High' | 'Medium' | 'Low';
  potentialSavingsKwh: number;
  potentialSavingsCost: number;
  potentialCo2AvoidedKg: number;
}
