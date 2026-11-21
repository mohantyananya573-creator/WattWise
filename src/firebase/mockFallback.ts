import {
  Appliance,
  BudgetSettings,
  MonthlyRecord,
  TariffSettings,
  UserProfile,
} from '../types';
import { DEFAULT_TARIFF_SETTINGS } from '../utils/calculations';
import { OFFICIAL_EMISSIONS_FACTORS } from '../utils/emissionsData';

const MOCK_STORAGE_KEY_USER = 'wattwise_mock_user';
const MOCK_STORAGE_KEY_PROFILE = 'wattwise_mock_profile';
const MOCK_STORAGE_KEY_APPLIANCES = 'wattwise_mock_appliances';
const MOCK_STORAGE_KEY_TARIFF = 'wattwise_mock_tariff';
const MOCK_STORAGE_KEY_RECORDS = 'wattwise_mock_records';
const MOCK_STORAGE_KEY_BUDGET = 'wattwise_mock_budget';

const DEFAULT_MOCK_USER = {
  uid: 'demo-user-123',
  email: 'demo@wattwise.org',
  displayName: 'Ananya Sharma',
};

const DEFAULT_MOCK_PROFILE: UserProfile = {
  id: 'demo-user-123',
  fullName: 'Ananya Sharma',
  email: 'demo@wattwise.org',
  location: 'Bhubaneswar, Odisha',
  householdType: 'Apartment',
  householdMembers: 4,
  electricityProvider: 'TP Central Odisha Distribution Ltd (TPCODL)',
  consumerCategory: 'Domestic (LT-1)',
  preferredBillingPeriod: '1 Month',
  monthlyBudget: 2500,
  role: 'user',
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

const DEFAULT_MOCK_APPLIANCES: Appliance[] = [
  {
    id: 'app-1',
    userId: 'demo-user-123',
    applianceName: 'Ceiling Fan (Living Room & Bedrooms)',
    category: 'Cooling',
    quantity: 3,
    wattage: 75,
    hoursPerDay: 10,
    usageDaysPerMonth: 30,
    averagePowerAdjustment: 1.0,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'app-2',
    userId: 'demo-user-123',
    applianceName: 'Inverter Split AC (Master Bedroom)',
    category: 'Cooling',
    quantity: 1,
    wattage: 1500,
    hoursPerDay: 7,
    usageDaysPerMonth: 25,
    averagePowerAdjustment: 0.80, // Inverter compressor modulation
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'app-3',
    userId: 'demo-user-123',
    applianceName: 'Refrigerator (Double Door 260L)',
    category: 'Kitchen',
    quantity: 1,
    wattage: 200,
    hoursPerDay: 24,
    usageDaysPerMonth: 30,
    averagePowerAdjustment: 0.60, // Cyclic compressor ~60% duty cycle
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'app-4',
    userId: 'demo-user-123',
    applianceName: 'LED Bulbs & Batten Lights',
    category: 'Lighting',
    quantity: 8,
    wattage: 9,
    hoursPerDay: 6,
    usageDaysPerMonth: 30,
    averagePowerAdjustment: 1.0,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'app-5',
    userId: 'demo-user-123',
    applianceName: 'Smart LED TV 50"',
    category: 'Entertainment',
    quantity: 1,
    wattage: 100,
    hoursPerDay: 4,
    usageDaysPerMonth: 30,
    averagePowerAdjustment: 1.0,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'app-6',
    userId: 'demo-user-123',
    applianceName: 'Laptop & Monitors Workstation',
    category: 'Entertainment',
    quantity: 2,
    wattage: 65,
    hoursPerDay: 8,
    usageDaysPerMonth: 22,
    averagePowerAdjustment: 1.0,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'app-7',
    userId: 'demo-user-123',
    applianceName: 'Front Load Washing Machine',
    category: 'Washing and Cleaning',
    quantity: 1,
    wattage: 500,
    hoursPerDay: 1.5,
    usageDaysPerMonth: 18,
    averagePowerAdjustment: 1.0,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
];

const DEFAULT_MOCK_BUDGET: BudgetSettings = {
  id: 'budget-123',
  userId: 'demo-user-123',
  monthlyBudget: 2500,
  currency: '₹',
  warningThresholds: {
    approaching: 70,
    nearLimit: 90,
    exceeded: 100,
  },
  updatedAt: new Date().toISOString(),
};

const DEFAULT_MOCK_RECORDS: MonthlyRecord[] = [
  {
    id: 'record-oct-2026',
    userId: 'demo-user-123',
    periodStart: '2026-10-01',
    periodEnd: '2026-10-31',
    monthName: 'October 2026',
    totalKwh: 432.8,
    estimatedBill: 2028.50,
    energyCharges: 1879.50,
    fixedCharge: 50.00,
    otherCharges: 99.00,
    credits: 0,
    monthlyBudget: 2500,
    carbonEmissionsKg: 309.9,
    emissionsFactor: 0.716,
    emissionsFactorSource: 'Central Electricity Authority (CEA) v19',
    applianceSnapshots: [],
    createdAt: '2026-10-31T18:00:00.000Z',
  },
  {
    id: 'record-sep-2026',
    userId: 'demo-user-123',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    monthName: 'September 2026',
    totalKwh: 485.4,
    estimatedBill: 2364.20,
    energyCharges: 2195.00,
    fixedCharge: 50.00,
    otherCharges: 119.20,
    credits: 0,
    monthlyBudget: 2500,
    carbonEmissionsKg: 347.5,
    emissionsFactor: 0.716,
    emissionsFactorSource: 'Central Electricity Authority (CEA) v19',
    applianceSnapshots: [],
    createdAt: '2026-09-30T18:00:00.000Z',
  },
];

let authSubscribers: Array<(user: any) => void> = [];

export const mockAuth = {
  login: async (email: string, _password: string) => {
    const user = { uid: 'demo-user-123', email, displayName: email.split('@')[0] || 'Demo User' };
    localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(user));
    authSubscribers.forEach((cb) => cb(user));
    return user;
  },
  register: async (email: string, _password: string, fullName: string) => {
    const user = { uid: 'demo-user-123', email, displayName: fullName };
    localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(user));
    const profile: UserProfile = {
      ...DEFAULT_MOCK_PROFILE,
      fullName,
      email,
    };
    localStorage.setItem(MOCK_STORAGE_KEY_PROFILE, JSON.stringify(profile));
    authSubscribers.forEach((cb) => cb(user));
    return user;
  },
  logout: async () => {
    localStorage.removeItem(MOCK_STORAGE_KEY_USER);
    authSubscribers.forEach((cb) => cb(null));
  },
  resetPassword: async (_email: string) => {
    // Simulated reset email dispatch
    return;
  },
  onAuthStateChanged: (callback: (user: any) => void) => {
    authSubscribers.push(callback);
    const stored = localStorage.getItem(MOCK_STORAGE_KEY_USER);
    const user = stored ? JSON.parse(stored) : DEFAULT_MOCK_USER;
    // ensure default user is logged in for preview
    if (!stored) {
      localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(DEFAULT_MOCK_USER));
    }
    setTimeout(() => callback(user), 0);
    return () => {
      authSubscribers = authSubscribers.filter((cb) => cb !== callback);
    };
  },
};

export const mockFirestore = {
  getUserProfile: async (_userId: string): Promise<UserProfile> => {
    const stored = localStorage.getItem(MOCK_STORAGE_KEY_PROFILE);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(MOCK_STORAGE_KEY_PROFILE, JSON.stringify(DEFAULT_MOCK_PROFILE));
    return DEFAULT_MOCK_PROFILE;
  },
  updateUserProfile: async (_userId: string, data: Partial<UserProfile>): Promise<void> => {
    const current = await mockFirestore.getUserProfile(_userId);
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(MOCK_STORAGE_KEY_PROFILE, JSON.stringify(updated));
  },
  getAppliances: async (_userId: string): Promise<Appliance[]> => {
    const stored = localStorage.getItem(MOCK_STORAGE_KEY_APPLIANCES);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(MOCK_STORAGE_KEY_APPLIANCES, JSON.stringify(DEFAULT_MOCK_APPLIANCES));
    return DEFAULT_MOCK_APPLIANCES;
  },
  addAppliance: async (userId: string, app: Omit<Appliance, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Appliance> => {
    const appliances = await mockFirestore.getAppliances(userId);
    const newApp: Appliance = {
      ...app,
      id: `app-${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newApp, ...appliances];
    localStorage.setItem(MOCK_STORAGE_KEY_APPLIANCES, JSON.stringify(updated));
    return newApp;
  },
  updateAppliance: async (userId: string, applianceId: string, app: Partial<Appliance>): Promise<void> => {
    const appliances = await mockFirestore.getAppliances(userId);
    const updated = appliances.map((a) => (a.id === applianceId ? { ...a, ...app, updatedAt: new Date().toISOString() } : a));
    localStorage.setItem(MOCK_STORAGE_KEY_APPLIANCES, JSON.stringify(updated));
  },
  deleteAppliance: async (userId: string, applianceId: string): Promise<void> => {
    const appliances = await mockFirestore.getAppliances(userId);
    const updated = appliances.filter((a) => a.id !== applianceId);
    localStorage.setItem(MOCK_STORAGE_KEY_APPLIANCES, JSON.stringify(updated));
  },
  getTariffSettings: async (_userId: string): Promise<TariffSettings> => {
    const stored = localStorage.getItem(MOCK_STORAGE_KEY_TARIFF);
    if (stored) return JSON.parse(stored);
    return DEFAULT_TARIFF_SETTINGS;
  },
  saveTariffSettings: async (_userId: string, settings: TariffSettings): Promise<void> => {
    localStorage.setItem(MOCK_STORAGE_KEY_TARIFF, JSON.stringify(settings));
  },
  getMonthlyRecords: async (_userId: string): Promise<MonthlyRecord[]> => {
    const stored = localStorage.getItem(MOCK_STORAGE_KEY_RECORDS);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(MOCK_STORAGE_KEY_RECORDS, JSON.stringify(DEFAULT_MOCK_RECORDS));
    return DEFAULT_MOCK_RECORDS;
  },
  saveMonthlyRecord: async (userId: string, record: Omit<MonthlyRecord, 'id' | 'userId' | 'createdAt'>): Promise<MonthlyRecord> => {
    const records = await mockFirestore.getMonthlyRecords(userId);
    const newRecord: MonthlyRecord = {
      ...record,
      id: `record-${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...records];
    localStorage.setItem(MOCK_STORAGE_KEY_RECORDS, JSON.stringify(updated));
    return newRecord;
  },
  deleteMonthlyRecord: async (userId: string, recordId: string): Promise<void> => {
    const records = await mockFirestore.getMonthlyRecords(userId);
    const updated = records.filter((r) => r.id !== recordId);
    localStorage.setItem(MOCK_STORAGE_KEY_RECORDS, JSON.stringify(updated));
  },
  getBudgetSettings: async (_userId: string): Promise<BudgetSettings> => {
    const stored = localStorage.getItem(MOCK_STORAGE_KEY_BUDGET);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(MOCK_STORAGE_KEY_BUDGET, JSON.stringify(DEFAULT_MOCK_BUDGET));
    return DEFAULT_MOCK_BUDGET;
  },
  saveBudgetSettings: async (_userId: string, budget: BudgetSettings): Promise<void> => {
    localStorage.setItem(MOCK_STORAGE_KEY_BUDGET, JSON.stringify(budget));
  },
  getEmissionsFactors: async () => {
    return OFFICIAL_EMISSIONS_FACTORS;
  },
};
