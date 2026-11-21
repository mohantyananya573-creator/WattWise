import React from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCo2, formatKwh, formatPercentage } from '../utils/formatters';
import {
  Leaf,
  TrendingDown,
  TrendingUp,
  Globe,
  Info,
  ExternalLink,
  ShieldCheck,
  Zap,
  HelpCircle,
  TreeDeciduous,
  Car,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const CarbonFootprintPage: React.FC = () => {
  const {
    totalHouseholdKwh,
    currentCarbonEmissionsKg,
    applianceSnapshots,
    monthlyRecords,
    emissionsFactors,
    selectedEmissionsFactor,
    setSelectedEmissionsFactor,
    previousMonthComparison,
  } = useData();

  // Environmental equivalents (for educational context)
  // ~1 mature tree absorbs ~22 kg CO2 per year (~1.83 kg per month)
  // ~1 km driven by average ICE passenger car produces ~0.192 kg CO2e
  const treesNeeded = Math.round((currentCarbonEmissionsKg / 22) * 10) / 10;
  const carKmEquivalent = Math.round(currentCarbonEmissionsKg / 0.192);

  // Historical carbon emissions trend data
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const trendData = [
    ...monthlyRecords
      .slice(0, 5)
      .reverse()
      .map((r) => ({
        month: r.monthName.split(' ')[0],
        emissions: r.carbonEmissionsKg,
        kwh: r.totalKwh,
      })),
    {
      month: `${currentDate.split(' ')[0]} (Cur)`,
      emissions: currentCarbonEmissionsKg,
      kwh: totalHouseholdKwh,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
          Carbon Footprint Tracker
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Estimate and track greenhouse gas emissions (kg CO₂e) associated with household grid electricity.
        </p>
      </div>

      {/* Top Carbon Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Monthly Carbon Footprint */}
        <Card className="p-5 space-y-2 bg-gradient-to-br from-white to-brand-pale/50" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Monthly Grid Emissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-light text-brand-primary flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-brand-dark">
            {formatCo2(currentCarbonEmissionsKg)}
          </div>
          <p className="text-xs text-brand-muted">
            From {formatKwh(totalHouseholdKwh)} grid electricity
          </p>
        </Card>

        {/* Metric 2: Previous Month Change */}
        <Card className="p-5 space-y-2" hoverEffect>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Month-over-Month Delta
          </span>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-brand-dark">
              {previousMonthComparison.previousRecord ? (
                formatCo2(Math.abs(previousMonthComparison.carbonDiff))
              ) : (
                '0.0 kg'
              )}
            </div>
            {previousMonthComparison.previousRecord && (
              <Badge
                variant={previousMonthComparison.carbonDiff <= 0 ? 'success' : 'warning'}
                size="sm"
              >
                {formatPercentage(previousMonthComparison.carbonPercent)}
              </Badge>
            )}
          </div>
          <p className="text-xs text-brand-muted truncate">
            {previousMonthComparison.previousRecord
              ? `Previous month: ${formatCo2(previousMonthComparison.previousRecord.carbonEmissionsKg)}`
              : 'Initial baseline record'}
          </p>
        </Card>

        {/* Metric 3: Trees to Offset Equivalency */}
        <Card className="p-5 space-y-2 bg-brand-light/40" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Annual Tree Absorption
            </span>
            <TreeDeciduous className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-2xl font-bold text-brand-dark">
            ~{treesNeeded} mature trees
          </div>
          <p className="text-xs text-brand-muted">
            Required annually to sequester this month&apos;s carbon
          </p>
        </Card>

        {/* Metric 4: Driving Equivalent */}
        <Card className="p-5 space-y-2 bg-white" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Vehicle Distance Equiv.
            </span>
            <Car className="w-4 h-4 text-brand-muted" />
          </div>
          <div className="text-2xl font-bold text-brand-dark">
            ~{carKmEquivalent.toLocaleString()} km
          </div>
          <p className="text-xs text-brand-muted">
            Equivalent tailpipe emissions from an average gasoline car
          </p>
        </Card>
      </div>

      {/* Grid Emissions Factor Selector */}
      <Card className="p-5 bg-white border-brand-border space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-brand-primary" />
            <div>
              <h3 className="text-sm font-bold text-brand-dark">
                Active Grid Emissions Factor
              </h3>
              <p className="text-xs text-brand-muted">
                Documented regional carbon intensity per kilowatt-hour of grid electricity
              </p>
            </div>
          </div>

          <div className="w-full sm:w-80">
            <select
              value={selectedEmissionsFactor.id}
              onChange={(e) => {
                const found = emissionsFactors.find((f) => f.id === e.target.value);
                if (found) setSelectedEmissionsFactor(found);
              }}
              className="w-full text-xs font-semibold border border-brand-border rounded-xl px-3 py-2 bg-white text-brand-dark focus:ring-2 focus:ring-brand-primary/20"
            >
              {emissionsFactors.map((factor) => (
                <option key={factor.id} value={factor.id}>
                  {factor.region} ({factor.factorValue} {factor.unit})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-3 bg-brand-pale rounded-xl border border-brand-border text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-brand-muted">Source Citation:</span>
            <p className="font-semibold text-brand-dark">
              {selectedEmissionsFactor.sourceName} ({selectedEmissionsFactor.referenceYear})
            </p>
          </div>
          <a
            href={selectedEmissionsFactor.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-brand-primary font-bold hover:underline inline-flex items-center gap-1"
          >
            Verify Source Methodology <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </Card>

      {/* Carbon Trend Chart & Appliance Carbon Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Historical Carbon Emissions */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-brand-dark">
                Monthly Carbon Emissions Trend
              </h3>
              <p className="text-xs text-brand-muted">
                Historical kg CO₂e greenhouse gas emissions over time
              </p>
            </div>
            <Badge variant="info">kg CO₂e</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1EAE3" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64746B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64746B' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} kg CO₂e`, 'Emissions']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E1EAE3',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="emissions"
                  stroke="#105B40"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#105B40', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bar Chart: Appliance Carbon Emissions Breakdown */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-brand-dark">
                Appliance Carbon Emissions
              </h3>
              <p className="text-xs text-brand-muted">
                Estimated kg CO₂e contribution by household appliance
              </p>
            </div>
            <Badge variant="neutral">Top Emitters</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={applianceSnapshots.slice(0, 6)}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1EAE3" />
                <XAxis
                  dataKey="applianceName"
                  tick={{ fontSize: 10, fill: '#64746B' }}
                  tickFormatter={(val) => (val.length > 10 ? `${val.slice(0, 8)}…` : val)}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64746B' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} kg CO₂e`, 'Carbon Output']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E1EAE3',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="carbonKg" fill="#16845B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Environmental Insights Section */}
      <Card className="p-6 bg-brand-pale border-brand-border space-y-3">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-brand-primary" />
          <h3 className="text-base font-bold text-brand-dark">Environmental Insights</h3>
        </div>
        <p className="text-xs text-brand-text leading-relaxed">
          {previousMonthComparison.previousRecord ? (
            previousMonthComparison.carbonDiff <= 0 ? (
              <>
                Your estimated electricity-related emissions decreased by{' '}
                <strong>{Math.abs(previousMonthComparison.carbonPercent)}%</strong> (a reduction of{' '}
                {formatCo2(Math.abs(previousMonthComparison.carbonDiff))}) compared with your previous saved month ({previousMonthComparison.previousRecord.monthName}).
              </>
            ) : (
              <>
                Your estimated electricity emissions increased by{' '}
                <strong>{previousMonthComparison.carbonPercent}%</strong> ({formatCo2(previousMonthComparison.carbonDiff)}) compared with your previous saved month. Check your high-load appliances.
              </>
            )
          ) : (
            'You are viewing your current baseline consumption. As you save calculations across months, WattWise will compute longitudinal environmental progress.'
          )}
        </p>
      </Card>

      {/* Educational Section (Mandatory as per Section 13) */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-primary" />
          <h3 className="text-base font-bold text-brand-dark">Understanding Grid Carbon Footprint</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-brand-muted leading-relaxed">
          <div className="p-4 bg-brand-pale/50 rounded-xl border border-brand-border space-y-2">
            <h4 className="font-bold text-brand-dark">What is a Carbon Footprint?</h4>
            <p>
              A carbon footprint quantifies the total greenhouse gas (GHG) emissions caused directly or indirectly by an individual, household, or organization, expressed in carbon dioxide equivalent (CO₂e).
            </p>
          </div>

          <div className="p-4 bg-brand-pale/50 rounded-xl border border-brand-border space-y-2">
            <h4 className="font-bold text-brand-dark">Why Electricity Creates Emissions</h4>
            <p>
              Electricity is generated using a regional energy mix. Thermal power plants burning fossil fuels (such as coal, natural gas, or oil) emit substantial CO₂ into the atmosphere during thermal generation.
            </p>
          </div>

          <div className="p-4 bg-brand-pale/50 rounded-xl border border-brand-border space-y-2">
            <h4 className="font-bold text-brand-dark">How Household Action Helps</h4>
            <p>
              Every kilowatt-hour avoided directly diminishes base and peak load demands on central thermal grid generators, preventing upstream fuel combustion and reducing atmospheric greenhouse burden.
            </p>
          </div>
        </div>

        <div className="p-3 bg-brand-light rounded-xl border border-brand-primary/20 text-xs text-brand-dark flex items-start gap-2">
          <Info className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
          <p>
            <strong>Scope Limitation:</strong> This module estimates electricity-related emissions resulting from grid electricity consumption. It does not measure your complete personal lifestyle carbon footprint (such as transportation, diet, or aviation).
          </p>
        </div>
      </Card>
    </div>
  );
};
