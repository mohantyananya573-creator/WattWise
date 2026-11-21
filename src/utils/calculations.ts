import {
  Appliance,
  ApplianceSnapshot,
  EnergySavingRecommendation,
  TariffSettings,
  TariffSlab,
} from '../types';

export const DEFAULT_TARIFF_SLABS: TariffSlab[] = [
  { fromUnit: 0, toUnit: 100, rate: 2.50 },
  { fromUnit: 100, toUnit: 200, rate: 4.00 },
  { fromUnit: 200, toUnit: 400, rate: 5.50 },
  { fromUnit: 400, toUnit: null, rate: 7.00 },
];

export const DEFAULT_TARIFF_SETTINGS: TariffSettings = {
  id: 'default-tariff',
  userId: '',
  provider: 'State Electricity Distribution Co.',
  consumerCategory: 'Domestic / Residential (LT-1)',
  tariffType: 'slab',
  slabConfiguration: DEFAULT_TARIFF_SLABS,
  flatRate: 5.0,
  fixedCharge: 50.0,
  otherCharges: 5.0, // 5% electricity duty / surcharge
  otherChargesType: 'percentage',
  creditsConfiguration: 0.0,
  currency: '₹',
  updatedAt: new Date().toISOString(),
};

/**
 * Calculates monthly kWh for an individual appliance.
 * Formula: (Rated Power in W * Quantity * Daily Usage Hours * Usage Days) / 1000 * averagePowerAdjustment
 */
export function calculateApplianceKwh(
  wattage: number,
  quantity: number,
  hoursPerDay: number,
  usageDaysPerMonth: number,
  averagePowerAdjustment: number = 1.0
): number {
  if (
    wattage <= 0 ||
    quantity <= 0 ||
    hoursPerDay <= 0 ||
    usageDaysPerMonth <= 0
  ) {
    return 0;
  }

  const factor = averagePowerAdjustment > 0 ? averagePowerAdjustment : 1.0;
  const rawKwh = (wattage * quantity * hoursPerDay * usageDaysPerMonth * factor) / 1000;
  // Round to 4 decimal places for precision without float drift
  return Math.round(rawKwh * 10000) / 10000;
}

/**
 * Calculates total household monthly electricity consumption across all appliances
 */
export function calculateTotalHouseholdKwh(appliances: Appliance[]): number {
  const total = appliances.reduce((sum, item) => {
    return sum + calculateApplianceKwh(
      item.wattage,
      item.quantity,
      item.hoursPerDay,
      item.usageDaysPerMonth,
      item.averagePowerAdjustment ?? 1.0
    );
  }, 0);
  return Math.round(total * 10000) / 10000;
}

/**
 * Calculates estimated electricity greenhouse gas emissions in kg CO2e.
 * Formula: Monthly Grid Electricity Consumption (kWh) * Grid Emissions Factor (kg CO2e/kWh)
 */
export function calculateCarbonEmissions(
  kwh: number,
  emissionsFactor: number
): number {
  if (kwh <= 0 || emissionsFactor <= 0) return 0;
  const emissions = kwh * emissionsFactor;
  return Math.round(emissions * 100) / 100;
}

export interface BillCalculationResult {
  totalKwh: number;
  energyCharges: number;
  fixedCharge: number;
  otherCharges: number;
  credits: number;
  totalEstimatedBill: number;
  effectiveRatePerKwh: number;
  slabBreakdown: {
    from: number;
    to: number | null;
    rate: number;
    unitsBilled: number;
    cost: number;
  }[];
}

/**
 * Calculates the monthly electricity bill using either progressive slab tariffs or flat rates.
 * Avoids floating-point errors by doing precise monetary rounding.
 */
export function calculateBill(
  totalKwh: number,
  tariff: TariffSettings = DEFAULT_TARIFF_SETTINGS
): BillCalculationResult {
  if (totalKwh <= 0) {
    return {
      totalKwh: 0,
      energyCharges: 0,
      fixedCharge: tariff.fixedCharge,
      otherCharges: 0,
      credits: tariff.creditsConfiguration,
      totalEstimatedBill: Math.max(0, tariff.fixedCharge - tariff.creditsConfiguration),
      effectiveRatePerKwh: 0,
      slabBreakdown: [],
    };
  }

  let energyChargesPaise = 0;
  const slabBreakdown: BillCalculationResult['slabBreakdown'] = [];

  if (tariff.tariffType === 'flat' && tariff.flatRate) {
    const cost = totalKwh * tariff.flatRate;
    energyChargesPaise = Math.round(cost * 100);
    slabBreakdown.push({
      from: 0,
      to: null,
      rate: tariff.flatRate,
      unitsBilled: totalKwh,
      cost: Math.round(cost * 100) / 100,
    });
  } else {
    // Progressive slab calculation
    // Sort slabs by fromUnit
    const sortedSlabs = [...tariff.slabConfiguration].sort((a, b) => a.fromUnit - b.fromUnit);

    for (const slab of sortedSlabs) {
      if (totalKwh <= slab.fromUnit) {
        continue;
      }

      let unitsInSlab = 0;
      if (slab.toUnit === null) {
        // Unbounded upper slab
        unitsInSlab = totalKwh - slab.fromUnit;
      } else {
        unitsInSlab = Math.min(totalKwh, slab.toUnit) - slab.fromUnit;
      }

      if (unitsInSlab > 0) {
        const slabCost = unitsInSlab * slab.rate;
        const slabCostPaise = Math.round(slabCost * 100);
        energyChargesPaise += slabCostPaise;
        slabBreakdown.push({
          from: slab.fromUnit,
          to: slab.toUnit,
          rate: slab.rate,
          unitsBilled: Math.round(unitsInSlab * 100) / 100,
          cost: slabCostPaise / 100,
        });
      }
    }
  }

  const energyCharges = energyChargesPaise / 100;
  const fixedCharge = Math.round(tariff.fixedCharge * 100) / 100;

  // Other charges calculation (percentage or flat)
  let otherCharges = 0;
  if (tariff.otherChargesType === 'percentage') {
    const taxableBase = energyCharges + fixedCharge;
    otherCharges = Math.round(taxableBase * (tariff.otherCharges / 100) * 100) / 100;
  } else {
    otherCharges = Math.round(tariff.otherCharges * 100) / 100;
  }

  const credits = Math.round(tariff.creditsConfiguration * 100) / 100;
  const subtotal = energyCharges + fixedCharge + otherCharges;
  const totalEstimatedBill = Math.max(0, Math.round((subtotal - credits) * 100) / 100);
  const effectiveRatePerKwh = totalKwh > 0 ? Math.round((totalEstimatedBill / totalKwh) * 100) / 100 : 0;

  return {
    totalKwh,
    energyCharges,
    fixedCharge,
    otherCharges,
    credits,
    totalEstimatedBill,
    effectiveRatePerKwh,
    slabBreakdown,
  };
}

/**
 * Creates appliance snapshots for historical records and detailed analysis
 */
export function calculateApplianceSnapshots(
  appliances: Appliance[],
  tariff: TariffSettings,
  emissionsFactor: number
): ApplianceSnapshot[] {
  const totalKwh = calculateTotalHouseholdKwh(appliances);
  const billResult = calculateBill(totalKwh, tariff);
  const avgRatePerKwh = totalKwh > 0 ? billResult.totalEstimatedBill / totalKwh : 0;

  return appliances.map((appliance) => {
    const kwh = calculateApplianceKwh(
      appliance.wattage,
      appliance.quantity,
      appliance.hoursPerDay,
      appliance.usageDaysPerMonth,
      appliance.averagePowerAdjustment ?? 1.0
    );
    const percentage = totalKwh > 0 ? Math.round((kwh / totalKwh) * 1000) / 10 : 0;
    const cost = Math.round(kwh * avgRatePerKwh * 100) / 100;
    const carbon = calculateCarbonEmissions(kwh, emissionsFactor);

    return {
      applianceId: appliance.id,
      applianceName: appliance.applianceName,
      category: appliance.category,
      wattage: appliance.wattage,
      quantity: appliance.quantity,
      hoursPerDay: appliance.hoursPerDay,
      usageDaysPerMonth: appliance.usageDaysPerMonth,
      monthlyKwh: kwh,
      percentageShare: percentage,
      costEstimate: cost,
      carbonKg: carbon,
    };
  });
}

/**
 * Rule-based recommendation engine for household energy efficiency
 */
export function generateRecommendations(
  appliances: Appliance[],
  totalKwh: number,
  estimatedBill: number,
  monthlyBudget: number = 0,
  tariff: TariffSettings = DEFAULT_TARIFF_SETTINGS,
  emissionsFactor: number = 0.716
): EnergySavingRecommendation[] {
  const recommendations: EnergySavingRecommendation[] = [];
  const avgUnitRate = totalKwh > 0 ? estimatedBill / totalKwh : (tariff.flatRate || 5);

  // Budget alert recommendation
  if (monthlyBudget > 0 && estimatedBill > monthlyBudget) {
    const overAmount = estimatedBill - monthlyBudget;
    recommendations.push({
      id: 'budget-exceeded-alert',
      title: 'Projected Electricity Spending Exceeds Monthly Budget',
      reason: `Your projected monthly bill of ₹${estimatedBill.toFixed(2)} exceeds your target budget of ₹${monthlyBudget.toFixed(2)} by ₹${overAmount.toFixed(2)}.`,
      applianceName: 'Whole Household',
      category: 'Other',
      suggestedAction: 'Review the highest-consuming appliances below first (e.g., Air Conditioners, Water Heaters) and trim daily operating hours by 1-2 hours.',
      priority: 'High',
      potentialSavingsKwh: Math.round((overAmount / avgUnitRate) * 10) / 10,
      potentialSavingsCost: Math.round(overAmount * 100) / 100,
      potentialCo2AvoidedKg: Math.round((overAmount / avgUnitRate) * emissionsFactor * 10) / 10,
    });
  }

  // Appliance specific recommendations
  for (const app of appliances) {
    const nameLower = app.applianceName.toLowerCase();
    const currentKwh = calculateApplianceKwh(
      app.wattage,
      app.quantity,
      app.hoursPerDay,
      app.usageDaysPerMonth,
      app.averagePowerAdjustment ?? 1.0
    );

    // 1. Air Conditioner optimizations
    if (app.category === 'Cooling' && (nameLower.includes('air conditioner') || nameLower.includes('ac'))) {
      if (app.hoursPerDay >= 6) {
        // Reducing by 2 hours/day or raising temp to 24-26 C saves ~18%
        const savedKwh = Math.round(currentKwh * 0.22 * 10) / 10;
        const savedCost = Math.round(savedKwh * avgUnitRate * 100) / 100;
        const savedCo2 = calculateCarbonEmissions(savedKwh, emissionsFactor);

        recommendations.push({
          id: `ac-optimization-${app.id}`,
          title: `Optimize ${app.applianceName} Usage & Thermostat Settings`,
          reason: `${app.applianceName} operates for ${app.hoursPerDay} hours/day, consuming ${currentKwh.toFixed(1)} kWh/month. Cooling is typically the highest household load.`,
          applianceName: app.applianceName,
          category: 'Cooling',
          suggestedAction: 'Set thermostat to 24°C–26°C instead of 18°C–20°C, clean air filters every 2 weeks, and use sleep timers to turn off 1–2 hours earlier.',
          priority: 'High',
          potentialSavingsKwh: savedKwh,
          potentialSavingsCost: savedCost,
          potentialCo2AvoidedKg: savedCo2,
        });
      }
    }

    // 2. Inefficient Lighting
    if (app.category === 'Lighting' && (app.wattage > 20 || nameLower.includes('incandescent') || nameLower.includes('cfl') || nameLower.includes('tube light'))) {
      // Upgrading to 9W LED bulb
      const ledWattage = 9;
      const newKwh = calculateApplianceKwh(ledWattage, app.quantity, app.hoursPerDay, app.usageDaysPerMonth, 1.0);
      const savedKwh = Math.max(0, Math.round((currentKwh - newKwh) * 10) / 10);
      const savedCost = Math.round(savedKwh * avgUnitRate * 100) / 100;
      const savedCo2 = calculateCarbonEmissions(savedKwh, emissionsFactor);

      recommendations.push({
        id: `lighting-upgrade-${app.id}`,
        title: `Upgrade ${app.applianceName} to Energy-Efficient 9W LEDs`,
        reason: `Your ${app.quantity}x ${app.applianceName} uses ${app.wattage}W each, consuming ${currentKwh.toFixed(1)} kWh/month. Modern LED bulbs deliver equivalent lumens at just 9W.`,
        applianceName: app.applianceName,
        category: 'Lighting',
        suggestedAction: `Replace ${app.quantity} older bulbs with 9W Bureau of Energy Efficiency (BEE) 5-star rated LED bulbs.`,
        priority: 'Medium',
        potentialSavingsKwh: savedKwh,
        potentialSavingsCost: savedCost,
        potentialCo2AvoidedKg: savedCo2,
      });
    }

    // 3. Ceiling Fans with long daily hours
    if (app.category === 'Cooling' && (nameLower.includes('fan') || nameLower.includes('ceiling fan'))) {
      if (app.hoursPerDay >= 12 && app.wattage >= 60) {
        // Upgrading to 28W BLDC or switching off unoccupied rooms (saving 3 hours)
        const savedHours = 3;
        const newKwh = calculateApplianceKwh(app.wattage, app.quantity, Math.max(1, app.hoursPerDay - savedHours), app.usageDaysPerMonth, 1.0);
        const savedKwh = Math.max(0, Math.round((currentKwh - newKwh) * 10) / 10);
        const savedCost = Math.round(savedKwh * avgUnitRate * 100) / 100;
        const savedCo2 = calculateCarbonEmissions(savedKwh, emissionsFactor);

        recommendations.push({
          id: `fan-efficiency-${app.id}`,
          title: `Reduce Idle Run Time for ${app.applianceName}`,
          reason: `${app.quantity}x ${app.applianceName} run for ${app.hoursPerDay} hours daily (${currentKwh.toFixed(1)} kWh/month). Regular fans are often left running in unoccupied rooms.`,
          applianceName: app.applianceName,
          category: 'Cooling',
          suggestedAction: 'Switch off fans immediately upon leaving rooms. For high-usage rooms, consider upgrading to 28W BLDC energy-saving fans which consume 60% less energy.',
          priority: 'Medium',
          potentialSavingsKwh: savedKwh,
          potentialSavingsCost: savedCost,
          potentialCo2AvoidedKg: savedCo2,
        });
      }
    }

    // 4. Water Heater / Geyser
    if (app.category === 'Heating' && (nameLower.includes('geyser') || nameLower.includes('water heater') || nameLower.includes('heater'))) {
      if (app.hoursPerDay > 1.5) {
        const targetHours = 1.0;
        const newKwh = calculateApplianceKwh(app.wattage, app.quantity, targetHours, app.usageDaysPerMonth, 1.0);
        const savedKwh = Math.max(0, Math.round((currentKwh - newKwh) * 10) / 10);
        const savedCost = Math.round(savedKwh * avgUnitRate * 100) / 100;
        const savedCo2 = calculateCarbonEmissions(savedKwh, emissionsFactor);

        recommendations.push({
          id: `geyser-optimization-${app.id}`,
          title: `Limit Pre-Heating Time for ${app.applianceName}`,
          reason: `Water heaters draw heavy power (${app.wattage}W). Keeping it on continuously leads to high standby thermal dissipation losses.`,
          applianceName: app.applianceName,
          category: 'Heating',
          suggestedAction: 'Turn on the geyser 15-20 minutes before bathing and switch it off immediately. Lower thermostat temperature to 50°C–55°C.',
          priority: 'High',
          potentialSavingsKwh: savedKwh,
          potentialSavingsCost: savedCost,
          potentialCo2AvoidedKg: savedCo2,
        });
      }
    }

    // 5. Entertainment / Standby vampire draw
    if (app.category === 'Entertainment' && (nameLower.includes('tv') || nameLower.includes('television') || nameLower.includes('console'))) {
      recommendations.push({
        id: `phantom-load-${app.id}`,
        title: `Eliminate Vampire Load from ${app.applianceName}`,
        reason: 'Consumer electronics and set-top boxes draw standby power 24/7 even when turned off via remote.',
        applianceName: app.applianceName,
        category: 'Entertainment',
        suggestedAction: 'Turn off the master wall socket or use a power strip with a toggle switch to cut idle standby drain completely.',
        priority: 'Low',
        potentialSavingsKwh: Math.round(app.quantity * 0.01 * 20 * 30 * 10) / 10, // ~6 kWh/month
        potentialSavingsCost: Math.round(6 * avgUnitRate * 100) / 100,
        potentialCo2AvoidedKg: calculateCarbonEmissions(6, emissionsFactor),
      });
    }
  }

  // General recommendation if very few appliances added
  if (appliances.length > 0 && recommendations.length === 0) {
    recommendations.push({
      id: 'general-conservation',
      title: 'Practice Good Energy Habits',
      reason: 'Your appliances are running within standard ranges. Maintaining good habits prevents consumption creep.',
      applianceName: 'General',
      category: 'Other',
      suggestedAction: 'Keep refrigerator coils clean, avoid placing hot food in the fridge, and leverage natural cross-ventilation during cool mornings and evenings.',
      priority: 'Low',
      potentialSavingsKwh: 10,
      potentialSavingsCost: Math.round(10 * avgUnitRate * 100) / 100,
      potentialCo2AvoidedKg: calculateCarbonEmissions(10, emissionsFactor),
    });
  }

  return recommendations;
}

/**
 * Interactive savings simulator calculation
 */
export function simulateSavings(
  appliance: Appliance,
  simulatedDailyHours: number,
  avgUnitRate: number,
  emissionsFactor: number
) {
  const originalKwh = calculateApplianceKwh(
    appliance.wattage,
    appliance.quantity,
    appliance.hoursPerDay,
    appliance.usageDaysPerMonth,
    appliance.averagePowerAdjustment ?? 1.0
  );

  const simulatedKwh = calculateApplianceKwh(
    appliance.wattage,
    appliance.quantity,
    simulatedDailyHours,
    appliance.usageDaysPerMonth,
    appliance.averagePowerAdjustment ?? 1.0
  );

  const kwhSaved = Math.max(0, Math.round((originalKwh - simulatedKwh) * 1000) / 1000);
  const moneySaved = Math.round(kwhSaved * avgUnitRate * 100) / 100;
  const co2AvoidedKg = calculateCarbonEmissions(kwhSaved, emissionsFactor);

  return {
    originalKwh,
    simulatedKwh,
    kwhSaved,
    moneySaved,
    co2AvoidedKg,
  };
}
