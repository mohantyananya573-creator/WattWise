import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { mockFirestore } from '../firebase/mockFallback';
import { CalculationSnapshot, MonthlyRecord } from '../types';
import { DEFAULT_TARIFF_SETTINGS } from './calculations';

// Mock localStorage for Node test runner
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe('WattWise Bill Predictor Save Functionality Tests', () => {
  const testUserId = 'test-user-save-101';

  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  beforeEach(() => {
    localStorage.clear();
  });

  describe('Feature 1: Save Calculation Snapshot', () => {
    it('successfully saves calculation snapshot to database with all required fields', async () => {
      const snapshotPayload: Omit<CalculationSnapshot, 'id' | 'userId' | 'createdAt'> = {
        calculationDate: new Date().toISOString(),
        periodStart: '2026-11-01',
        periodEnd: '2026-11-30',
        provider: 'State Electricity Board',
        consumerCategory: 'Domestic (LT-1)',
        tariffType: 'slab',
        totalKwh: 350.5,
        energyCharges: 1450.0,
        fixedCharge: 60.0,
        otherCharges: 75.0,
        credits: 0,
        totalEstimatedBill: 1585.0,
        effectiveRatePerKwh: 4.52,
        applianceSnapshots: [
          {
            applianceId: 'app-test-1',
            applianceName: 'Air Conditioner',
            category: 'Cooling',
            wattage: 1500,
            quantity: 1,
            hoursPerDay: 6,
            usageDaysPerMonth: 25,
            monthlyKwh: 180,
            percentageShare: 51.35,
            costEstimate: 813.6,
            carbonKg: 128.88,
          },
        ],
        appliedSlabs: [
          { from: 0, to: 100, rate: 2.5, unitsBilled: 100, cost: 250 },
          { from: 100, to: 200, rate: 4.0, unitsBilled: 100, cost: 400 },
          { from: 200, to: 400, rate: 5.5, unitsBilled: 150.5, cost: 827.75 },
        ],
        emissionsFactor: 0.716,
        emissionsFactorSource: 'Central Electricity Authority (CEA) v19',
        carbonEmissionsKg: 250.96,
      };

      const saved = await mockFirestore.saveCalculationSnapshot(testUserId, snapshotPayload);

      expect(saved.id).toBeDefined();
      expect(saved.id).toMatch(/^snapshot-/);
      expect(saved.userId).toBe(testUserId);
      expect(saved.totalEstimatedBill).toBe(1585.0);
      expect(saved.totalKwh).toBe(350.5);
      expect(saved.applianceSnapshots).toHaveLength(1);
      expect(saved.applianceSnapshots[0].applianceName).toBe('Air Conditioner');

      // Verify persistence: retrieve from storage
      const allSnapshots = await mockFirestore.getCalculationSnapshots(testUserId);
      expect(allSnapshots).toHaveLength(1);
      expect(allSnapshots[0].id).toBe(saved.id);
      expect(allSnapshots[0].appliedSlabs).toHaveLength(3);
    });

    it('preserves appliance assumptions in snapshot even if original appliance data changes later', async () => {
      // Create initial snapshot
      const originalSnapshot = await mockFirestore.saveCalculationSnapshot(testUserId, {
        calculationDate: new Date().toISOString(),
        periodStart: '2026-11-01',
        periodEnd: '2026-11-30',
        provider: 'TPCODL',
        consumerCategory: 'Domestic',
        tariffType: 'slab',
        totalKwh: 200,
        energyCharges: 800,
        fixedCharge: 50,
        otherCharges: 40,
        credits: 0,
        totalEstimatedBill: 890,
        effectiveRatePerKwh: 4.45,
        applianceSnapshots: [
          {
            applianceId: 'fan-1',
            applianceName: 'Ceiling Fan',
            category: 'Cooling',
            wattage: 75,
            quantity: 2,
            hoursPerDay: 10,
            usageDaysPerMonth: 30,
            monthlyKwh: 45,
            percentageShare: 22.5,
            costEstimate: 200.25,
            carbonKg: 32.22,
          },
        ],
        appliedSlabs: [],
        emissionsFactor: 0.716,
        emissionsFactorSource: 'CEA',
        carbonEmissionsKg: 143.2,
      });

      // Retrieve snapshot
      const retrieved = await mockFirestore.getCalculationSnapshots(testUserId);
      expect(retrieved[0].applianceSnapshots[0].wattage).toBe(75);
      expect(retrieved[0].applianceSnapshots[0].quantity).toBe(2);

      // Snapshot remains identical even if another snapshot is added
      expect(originalSnapshot.applianceSnapshots[0].quantity).toBe(2);
    });
  });

  describe('Feature 2: Save Monthly Record & Duplicate Handling', () => {
    it('successfully saves a new monthly record', async () => {
      const recordPayload: Omit<MonthlyRecord, 'id' | 'userId' | 'createdAt'> = {
        periodStart: '2026-11-01',
        periodEnd: '2026-11-30',
        monthName: 'November 2026',
        totalKwh: 420.0,
        estimatedBill: 1950.0,
        energyCharges: 1800.0,
        fixedCharge: 60.0,
        otherCharges: 90.0,
        credits: 0,
        monthlyBudget: 2500,
        carbonEmissionsKg: 300.72,
        emissionsFactor: 0.716,
        emissionsFactorSource: 'CEA v19',
        applianceSnapshots: [],
        tariffSnapshot: DEFAULT_TARIFF_SETTINGS,
      };

      const saved = await mockFirestore.saveMonthlyRecord(testUserId, recordPayload);
      expect(saved.id).toBeDefined();
      expect(saved.totalKwh).toBe(420.0);
      expect(saved.estimatedBill).toBe(1950.0);
      expect(saved.tariffSnapshot).toBeDefined();
    });

    it('updates an existing record when overwriteRecordId is specified (preventing duplicate proliferation)', async () => {
      // Save initial record for November
      const initial = await mockFirestore.saveMonthlyRecord(testUserId, {
        periodStart: '2026-11-01',
        periodEnd: '2026-11-30',
        monthName: 'November 2026',
        totalKwh: 300.0,
        estimatedBill: 1200.0,
        energyCharges: 1100.0,
        fixedCharge: 50.0,
        otherCharges: 50.0,
        credits: 0,
        monthlyBudget: 2000,
        carbonEmissionsKg: 214.8,
        emissionsFactor: 0.716,
        emissionsFactorSource: 'CEA v19',
        applianceSnapshots: [],
      });

      // User re-calculates and updates the same billing period
      const updated = await mockFirestore.saveMonthlyRecord(
        testUserId,
        {
          periodStart: '2026-11-01',
          periodEnd: '2026-11-30',
          monthName: 'November 2026',
          totalKwh: 350.0,
          estimatedBill: 1450.0,
          energyCharges: 1320.0,
          fixedCharge: 50.0,
          otherCharges: 80.0,
          credits: 0,
          monthlyBudget: 2000,
          carbonEmissionsKg: 250.6,
          emissionsFactor: 0.716,
          emissionsFactorSource: 'CEA v19',
          applianceSnapshots: [],
        },
        initial.id // pass overwriteRecordId
      );

      expect(updated.id).toBe(initial.id);
      expect(updated.totalKwh).toBe(350.0);
      expect(updated.estimatedBill).toBe(1450.0);
      expect(updated.updatedAt).toBeDefined();

      // Ensure total count in storage remains 1 (no duplicate created)
      const allRecords = await mockFirestore.getMonthlyRecords(testUserId);
      const matchingRecords = allRecords.filter((r) => r.periodStart === '2026-11-01');
      expect(matchingRecords).toHaveLength(1);
      expect(matchingRecords[0].estimatedBill).toBe(1450.0);
    });
  });

  describe('Test C: Error Handling & Validation', () => {
    it('handles duplicate monthly records appropriately by matching billing period start and end', async () => {
      // Seed record
      await mockFirestore.saveMonthlyRecord(testUserId, {
        periodStart: '2026-12-01',
        periodEnd: '2026-12-31',
        monthName: 'December 2026',
        totalKwh: 500,
        estimatedBill: 2500,
        energyCharges: 2300,
        fixedCharge: 60,
        otherCharges: 140,
        credits: 0,
        monthlyBudget: 3000,
        carbonEmissionsKg: 358,
        emissionsFactor: 0.716,
        emissionsFactorSource: 'CEA',
        applianceSnapshots: [],
      });

      const records = await mockFirestore.getMonthlyRecords(testUserId);
      const duplicate = records.find(
        (r) => r.periodStart === '2026-12-01' && r.periodEnd === '2026-12-31'
      );

      expect(duplicate).toBeDefined();
      expect(duplicate?.monthName).toBe('December 2026');
    });

    it('successfully deletes a calculation snapshot when requested', async () => {
      const snap = await mockFirestore.saveCalculationSnapshot(testUserId, {
        calculationDate: new Date().toISOString(),
        periodStart: '2026-11-01',
        periodEnd: '2026-11-30',
        provider: 'State Grid',
        consumerCategory: 'Domestic',
        tariffType: 'flat',
        totalKwh: 100,
        energyCharges: 400,
        fixedCharge: 50,
        otherCharges: 20,
        credits: 0,
        totalEstimatedBill: 470,
        effectiveRatePerKwh: 4.7,
        applianceSnapshots: [],
        appliedSlabs: [],
        emissionsFactor: 0.716,
        emissionsFactorSource: 'CEA',
        carbonEmissionsKg: 71.6,
      });

      let all = await mockFirestore.getCalculationSnapshots(testUserId);
      expect(all.some((s) => s.id === snap.id)).toBe(true);

      await mockFirestore.deleteCalculationSnapshot(testUserId, snap.id);
      all = await mockFirestore.getCalculationSnapshots(testUserId);
      expect(all.some((s) => s.id === snap.id)).toBe(false);
    });
  });
});
