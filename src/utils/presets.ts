import { ApplianceCategory } from '../types';

export interface AppliancePreset {
  name: string;
  category: ApplianceCategory;
  defaultWattage: number;
  typicalDailyHours: number;
  typicalDaysPerMonth: number;
  hasDutyCycleAdjustment?: boolean;
  defaultDutyCycle?: number;
  description: string;
}

export const APPLIANCE_PRESETS: AppliancePreset[] = [
  {
    name: 'Ceiling Fan',
    category: 'Cooling',
    defaultWattage: 75,
    typicalDailyHours: 10,
    typicalDaysPerMonth: 30,
    description: 'Standard 1200mm ceiling fan'
  },
  {
    name: 'LED Bulb',
    category: 'Lighting',
    defaultWattage: 9,
    typicalDailyHours: 6,
    typicalDaysPerMonth: 30,
    description: 'Energy-efficient household LED bulb'
  },
  {
    name: 'Television (LED/Smart TV)',
    category: 'Entertainment',
    defaultWattage: 100,
    typicalDailyHours: 4,
    typicalDaysPerMonth: 30,
    description: '43"-55" Smart LED Television'
  },
  {
    name: 'Refrigerator (Single/Double Door)',
    category: 'Kitchen',
    defaultWattage: 200,
    typicalDailyHours: 24,
    typicalDaysPerMonth: 30,
    hasDutyCycleAdjustment: true,
    defaultDutyCycle: 0.60, // Compressor operates ~60% of the day
    description: 'Frost-free refrigerator with cyclic compressor load'
  },
  {
    name: 'Air Conditioner (1.5 Ton Split)',
    category: 'Cooling',
    defaultWattage: 1500,
    typicalDailyHours: 8,
    typicalDaysPerMonth: 30,
    hasDutyCycleAdjustment: true,
    defaultDutyCycle: 0.85,
    description: '1.5 Ton split air conditioner'
  },
  {
    name: 'Laptop / PC',
    category: 'Entertainment',
    defaultWattage: 65,
    typicalDailyHours: 8,
    typicalDaysPerMonth: 25,
    description: 'Modern laptop charger / work station'
  },
  {
    name: 'Washing Machine',
    category: 'Washing and Cleaning',
    defaultWattage: 500,
    typicalDailyHours: 1.5,
    typicalDaysPerMonth: 20,
    description: 'Fully automatic top or front load washer'
  },
  {
    name: 'Electric Iron',
    category: 'Washing and Cleaning',
    defaultWattage: 1000,
    typicalDailyHours: 0.5,
    typicalDaysPerMonth: 20,
    description: 'Steam or dry clothing iron'
  },
  {
    name: 'Water Pump (0.75-1 HP)',
    category: 'Other',
    defaultWattage: 750,
    typicalDailyHours: 1,
    typicalDaysPerMonth: 30,
    description: 'Domestic water lifting monoblock pump'
  },
  {
    name: 'Water Heater / Geyser',
    category: 'Heating',
    defaultWattage: 2000,
    typicalDailyHours: 1,
    typicalDaysPerMonth: 30,
    description: 'Storage electric water heater'
  },
  {
    name: 'Microwave Oven',
    category: 'Kitchen',
    defaultWattage: 1200,
    typicalDailyHours: 0.5,
    typicalDaysPerMonth: 30,
    description: 'Standard household microwave'
  },
  {
    name: 'Induction Cooktop',
    category: 'Kitchen',
    defaultWattage: 1800,
    typicalDailyHours: 1.5,
    typicalDaysPerMonth: 30,
    description: 'Single-zone portable induction stove'
  }
];

export const CATEGORY_ICONS: Record<ApplianceCategory, string> = {
  Cooling: 'Wind',
  Lighting: 'Lightbulb',
  Kitchen: 'Utensils',
  Entertainment: 'Tv',
  'Washing and Cleaning': 'Shirt',
  Heating: 'Flame',
  Other: 'Zap',
};
