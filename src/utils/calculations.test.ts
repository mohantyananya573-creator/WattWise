import { describe, it, expect } from 'vitest';
import {
  calculateApplianceKwh,
  calculateCarbonEmissions,
  calculateBill,
  DEFAULT_TARIFF_SETTINGS,
} from './calculations';

describe('WattWise Energy & Emissions Calculations', () => {
  // Required Calculation Tests from Prompt Section 19:

  it('Test 1: 1 appliance, 100 W, 5 hours/day, 30 days should equal 15 kWh', () => {
    const kwh = calculateApplianceKwh(100, 1, 5, 30);
    expect(kwh).toBe(15);
  });

  it('Test 2: 2 appliances, 100 W each, 5 hours/day, 30 days should equal 30 kWh', () => {
    const kwh = calculateApplianceKwh(100, 2, 5, 30);
    expect(kwh).toBe(30);
  });

  it('Test 3: Three 75 W fans, 10 hours/day, 30 days should equal 67.5 kWh', () => {
    const kwh = calculateApplianceKwh(75, 3, 10, 30);
    expect(kwh).toBe(67.5);
  });

  it('Test 4: 150 kWh * 0.5 kg CO2e/kWh should equal 75 kg CO2e', () => {
    const emissions = calculateCarbonEmissions(150, 0.5);
    expect(emissions).toBe(75);
  });

  // Additional comprehensive tests for Progressive Slab Billing
  describe('Progressive Slab Tariff Calculations', () => {
    const testTariff = {
      ...DEFAULT_TARIFF_SETTINGS,
      slabConfiguration: [
        { fromUnit: 0, toUnit: 100, rate: 2.50 },
        { fromUnit: 100, toUnit: 200, rate: 4.00 },
        { fromUnit: 200, toUnit: 400, rate: 5.50 },
        { fromUnit: 400, toUnit: null, rate: 7.00 },
      ],
      fixedCharge: 50.0,
      otherCharges: 0.0, // test raw energy charges first
      creditsConfiguration: 0.0,
    };

    it('calculates consumption within first slab (e.g. 80 units @ 2.50 = 200)', () => {
      const result = calculateBill(80, testTariff);
      expect(result.energyCharges).toBe(200);
      expect(result.fixedCharge).toBe(50);
      expect(result.totalEstimatedBill).toBe(250);
    });

    it('calculates consumption crossing into second slab (e.g. 150 units = 100*2.50 + 50*4.00 = 450)', () => {
      const result = calculateBill(150, testTariff);
      // Slab 1: 100 * 2.50 = 250
      // Slab 2: 50 * 4.00 = 200
      // Total Energy = 450
      expect(result.energyCharges).toBe(450);
      expect(result.totalEstimatedBill).toBe(500); // 450 + 50 fixed
    });

    it('calculates multi-tier slab consumption crossing into third slab (e.g. 250 units = 250 + 400 + 275 = 925)', () => {
      const result = calculateBill(250, testTariff);
      // Slab 1: 100 * 2.50 = 250
      // Slab 2: 100 * 4.00 = 400
      // Slab 3: 50 * 5.50 = 275
      // Total Energy = 925
      expect(result.energyCharges).toBe(925);
      expect(result.totalEstimatedBill).toBe(975); // 925 + 50 fixed
    });

    it('calculates highest tier unbounded slab (e.g. 450 units = 250 + 400 + 1100 + 50*7 = 2100)', () => {
      const result = calculateBill(450, testTariff);
      // Slab 1: 100 * 2.50 = 250
      // Slab 2: 100 * 4.00 = 400
      // Slab 3: 200 * 5.50 = 1100
      // Slab 4: 50 * 7.00 = 350
      // Total Energy = 2100
      expect(result.energyCharges).toBe(2100);
      expect(result.totalEstimatedBill).toBe(2150); // 2100 + 50 fixed
    });

    it('applies percentage surcharge and credits correctly', () => {
      const tariffWithTaxesAndCredits = {
        ...testTariff,
        fixedCharge: 50,
        otherCharges: 10, // 10% tax
        otherChargesType: 'percentage' as const,
        creditsConfiguration: 100, // ₹100 subsidy
      };
      // For 100 units: energy = 250, fixed = 50. Taxable base = 300.
      // 10% tax = 30. Subtotal = 330. Minus credits 100 = 230.
      const result = calculateBill(100, tariffWithTaxesAndCredits);
      expect(result.energyCharges).toBe(250);
      expect(result.fixedCharge).toBe(50);
      expect(result.otherCharges).toBe(30);
      expect(result.credits).toBe(100);
      expect(result.totalEstimatedBill).toBe(230);
    });
  });

  describe('Average Power / Duty Cycle adjustments', () => {
    it('applies duty cycle factor for cyclic appliances such as refrigerator', () => {
      // 200W refrigerator running 24h/day with 60% compressor duty cycle for 30 days
      // (200 * 1 * 24 * 30) / 1000 * 0.6 = 144 * 0.6 = 86.4 kWh
      const kwh = calculateApplianceKwh(200, 1, 24, 30, 0.6);
      expect(kwh).toBe(86.4);
    });
  });
});
