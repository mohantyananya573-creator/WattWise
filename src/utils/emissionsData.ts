import { EmissionsFactor } from '../types';

export const OFFICIAL_EMISSIONS_FACTORS: EmissionsFactor[] = [
  {
    id: 'cea-india-grid',
    region: 'India (National Grid Average - CEA Baseline)',
    factorValue: 0.716, // kg CO2e per kWh
    unit: 'kg CO2e/kWh',
    sourceName: 'Central Electricity Authority (CEA), Ministry of Power, Govt. of India - CO2 Baseline Database v19',
    sourceUrl: 'https://cea.nic.in/cdm-co2-baseline-database',
    referenceYear: 2023,
    updatedAt: '2024-03-01T00:00:00.000Z',
    active: true,
  },
  {
    id: 'usepa-egrid',
    region: 'United States (National Average - US EPA eGRID)',
    factorValue: 0.386,
    unit: 'kg CO2e/kWh',
    sourceName: 'US Environmental Protection Agency (EPA) eGRID Summary Tables',
    sourceUrl: 'https://www.epa.gov/egrid',
    referenceYear: 2022,
    updatedAt: '2024-01-30T00:00:00.000Z',
    active: true,
  },
  {
    id: 'uk-defra',
    region: 'United Kingdom (DESNZ / DEFRA Conversion Factors)',
    factorValue: 0.207,
    unit: 'kg CO2e/kWh',
    sourceName: 'UK Department for Energy Security and Net Zero (DESNZ) GHG Conversion Factors',
    sourceUrl: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting',
    referenceYear: 2023,
    updatedAt: '2023-06-15T00:00:00.000Z',
    active: true,
  },
  {
    id: 'eea-europe',
    region: 'European Union (EEA Average)',
    factorValue: 0.251,
    unit: 'kg CO2e/kWh',
    sourceName: 'European Environment Agency (EEA) - Greenhouse Gas Emission Intensity of Electricity Generation',
    sourceUrl: 'https://www.eea.europa.eu/en/analysis/indicators/greenhouse-gas-emission-intensity-of-electricity-generation',
    referenceYear: 2022,
    updatedAt: '2023-11-20T00:00:00.000Z',
    active: true,
  },
  {
    id: 'iea-global',
    region: 'Global Average (IEA World Energy Outlook)',
    factorValue: 0.436,
    unit: 'kg CO2e/kWh',
    sourceName: 'International Energy Agency (IEA) Global Energy & Climate Model',
    sourceUrl: 'https://www.iea.org/reports/world-energy-outlook',
    referenceYear: 2023,
    updatedAt: '2024-02-10T00:00:00.000Z',
    active: true,
  }
];

export const DEFAULT_EMISSIONS_FACTOR = OFFICIAL_EMISSIONS_FACTORS[0]; // Default to Indian Grid CEA for ₹ / India household context
