import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { ApplianceCategory, ApplianceSnapshot } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatKwh, formatCo2 } from '../utils/formatters';
import {
  PieChart as PieIcon,
  BarChart2,
  TrendingUp,
  Zap,
  ArrowUpDown,
  Filter,
  Eye,
  Award,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const ConsumptionAnalysisPage: React.FC = () => {
  const { applianceSnapshots, totalHouseholdKwh } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortField, setSortField] = useState<'kwh' | 'name' | 'percentage'>('kwh');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [inspectAppliance, setInspectAppliance] = useState<ApplianceSnapshot | null>(null);

  // Category aggregations
  const categoryData = useMemo(() => {
    const map: Record<string, { kwh: number; count: number }> = {};
    for (const snap of applianceSnapshots) {
      if (!map[snap.category]) {
        map[snap.category] = { kwh: 0, count: 0 };
      }
      map[snap.category].kwh += snap.monthlyKwh;
      map[snap.category].count += snap.quantity;
    }

    return Object.entries(map).map(([cat, data]) => ({
      category: cat,
      kwh: Math.round(data.kwh * 10) / 10,
      count: data.count,
    }));
  }, [applianceSnapshots]);

  // Filtered and sorted ranking table
  const sortedAndFiltered = useMemo(() => {
    let list = [...applianceSnapshots];
    if (selectedCategory !== 'All') {
      list = list.filter((a) => a.category === selectedCategory);
    }

    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'kwh') comparison = a.monthlyKwh - b.monthlyKwh;
      if (sortField === 'name') comparison = a.applianceName.localeCompare(b.applianceName);
      if (sortField === 'percentage') comparison = a.percentageShare - b.percentageShare;
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return list;
  }, [applianceSnapshots, selectedCategory, sortField, sortOrder]);

  const highestAppliance = applianceSnapshots.length > 0 ? [...applianceSnapshots].sort((a, b) => b.monthlyKwh - a.monthlyKwh)[0] : null;
  const lowestAppliance = applianceSnapshots.length > 0 ? [...applianceSnapshots].sort((a, b) => a.monthlyKwh - b.monthlyKwh)[0] : null;

  // Chart colors
  const GREEN_PALETTE = ['#16845B', '#105B40', '#38A169', '#48BB78', '#68D391', '#9AE6B4', '#276749'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
          Consumption Analysis
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Detailed appliance ranking, load contributions, and category-wise energy analytics.
        </p>
      </div>

      {/* Highlights Top Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 space-y-2 bg-white" hoverEffect>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Total Household Load
          </span>
          <div className="text-2xl font-extrabold text-brand-dark">
            {formatKwh(totalHouseholdKwh)}
          </div>
          <p className="text-xs text-brand-muted">
            Aggregated across {applianceSnapshots.length} active household appliances
          </p>
        </Card>

        <Card className="p-5 space-y-2 bg-brand-pale" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Highest Consuming Load
            </span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-brand-dark truncate">
            {highestAppliance ? highestAppliance.applianceName : 'None'}
          </div>
          <p className="text-xs text-brand-muted">
            {highestAppliance
              ? `${formatKwh(highestAppliance.monthlyKwh)} (${highestAppliance.percentageShare}% of total)`
              : 'Add appliances to evaluate'}
          </p>
        </Card>

        <Card className="p-5 space-y-2 bg-brand-light/50" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Lowest Consuming Load
            </span>
            <Zap className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-xl font-bold text-brand-dark truncate">
            {lowestAppliance ? lowestAppliance.applianceName : 'None'}
          </div>
          <p className="text-xs text-brand-muted">
            {lowestAppliance
              ? `${formatKwh(lowestAppliance.monthlyKwh)} (${lowestAppliance.percentageShare}% of total)`
              : 'Add appliances to evaluate'}
          </p>
        </Card>
      </div>

      {/* Visual Analytics Charts (3 Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Donut chart for appliance contribution */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-brand-dark">
              Appliance Contribution Share
            </h3>
            <p className="text-xs text-brand-muted">Donut distribution of monthly kWh units</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applianceSnapshots}
                  dataKey="monthlyKwh"
                  nameKey="applianceName"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {applianceSnapshots.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={GREEN_PALETTE[index % GREEN_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} kWh`, name]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E1EAE3',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Horizontal Bar Chart for Appliance Units */}
        <Card className="p-6 space-y-4 lg:col-span-2">
          <div>
            <h3 className="text-base font-bold text-brand-dark">
              Appliance Consumption Comparison
            </h3>
            <p className="text-xs text-brand-muted">Monthly kWh per appliance load</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedAndFiltered.slice(0, 8)}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E1EAE3" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64746B' }} />
                <YAxis
                  dataKey="applianceName"
                  type="category"
                  tick={{ fontSize: 11, fill: '#172B22' }}
                  width={90}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} kWh`, 'Monthly Units']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E1EAE3',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="monthlyKwh" fill="#16845B" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Chart 3: Category-wise Breakdown */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-brand-dark">Category-wise Energy Consumption</h3>
            <p className="text-xs text-brand-muted">Total units (kWh) consumed by appliance functional category</p>
          </div>
          <Badge variant="neutral">Functional Groups</Badge>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1EAE3" />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64746B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64746B' }} />
              <Tooltip
                formatter={(val: any) => [`${val} kWh`, 'Category Load']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  borderColor: '#E1EAE3',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="kwh" fill="#38A169" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Ranking Table Section */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-brand-dark">Appliance Consumption Ranking</h3>
            <p className="text-xs text-brand-muted">
              Complete breakdown sorted by energy draw, cost estimate, and carbon emissions
            </p>
          </div>

          {/* Table Filters & Sorting */}
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-brand-border rounded-xl px-3 py-2 bg-white text-brand-text"
            >
              <option value="All">All Categories</option>
              <option value="Cooling">Cooling</option>
              <option value="Lighting">Lighting</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Washing and Cleaning">Washing & Cleaning</option>
              <option value="Heating">Heating</option>
              <option value="Other">Other</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 text-xs border border-brand-border rounded-xl px-3 py-2 bg-white text-brand-text hover:bg-brand-pale"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-brand-primary" />
              <span>{sortOrder === 'asc' ? 'Low to High' : 'High to Low'}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted font-bold uppercase tracking-wider">
                <th className="py-3 px-2">Rank</th>
                <th className="py-3">Appliance</th>
                <th className="py-3">Category</th>
                <th className="py-3 text-right">Power × Qty</th>
                <th className="py-3 text-right">Monthly (kWh)</th>
                <th className="py-3 text-right">Share (%)</th>
                <th className="py-3 text-right">Est. Cost</th>
                <th className="py-3 text-right">CO₂e (kg)</th>
                <th className="py-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {sortedAndFiltered.map((snap, idx) => (
                <tr key={snap.applianceId} className="hover:bg-brand-pale/50 transition-colors">
                  <td className="py-3 px-2 font-bold text-brand-dark">#{idx + 1}</td>
                  <td className="py-3 font-semibold text-brand-dark">{snap.applianceName}</td>
                  <td className="py-3">
                    <Badge variant="neutral" size="sm">
                      {snap.category}
                    </Badge>
                  </td>
                  <td className="py-3 text-right text-brand-muted">
                    {snap.wattage}W × {snap.quantity}
                  </td>
                  <td className="py-3 text-right font-bold text-brand-dark">
                    {formatKwh(snap.monthlyKwh)}
                  </td>
                  <td className="py-3 text-right font-semibold text-brand-primary">
                    {snap.percentageShare}%
                  </td>
                  <td className="py-3 text-right font-medium text-emerald-800">
                    {formatCurrency(snap.costEstimate)}
                  </td>
                  <td className="py-3 text-right text-brand-muted">
                    {formatCo2(snap.carbonKg)}
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => setInspectAppliance(snap)}
                      className="p-1 rounded text-brand-muted hover:text-brand-primary hover:bg-brand-light"
                      title="Inspect Appliance Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Appliance Detail Modal */}
      <Modal
        isOpen={Boolean(inspectAppliance)}
        onClose={() => setInspectAppliance(null)}
        title={inspectAppliance?.applianceName || 'Appliance Details'}
        description="Comprehensive load profile and environmental consumption statistics."
        maxWidth="md"
      >
        {inspectAppliance && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-brand-pale p-3.5 rounded-xl border border-brand-border">
              <div>
                <span className="text-brand-muted block">Category:</span>
                <span className="font-semibold text-brand-dark">{inspectAppliance.category}</span>
              </div>
              <div>
                <span className="text-brand-muted block">Rated Wattage:</span>
                <span className="font-semibold text-brand-dark">{inspectAppliance.wattage} Watts</span>
              </div>
              <div>
                <span className="text-brand-muted block">Operating Hours:</span>
                <span className="font-semibold text-brand-dark">{inspectAppliance.hoursPerDay} hrs/day</span>
              </div>
              <div>
                <span className="text-brand-muted block">Monthly Active Days:</span>
                <span className="font-semibold text-brand-dark">{inspectAppliance.usageDaysPerMonth} days/month</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-brand-border">
              <div className="flex justify-between py-1 border-b border-brand-border/40">
                <span className="text-brand-muted">Monthly Electricity Draw:</span>
                <span className="font-bold text-brand-dark">{formatKwh(inspectAppliance.monthlyKwh)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border/40">
                <span className="text-brand-muted">Contribution to Household Total:</span>
                <span className="font-bold text-brand-primary">{inspectAppliance.percentageShare}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border/40">
                <span className="text-brand-muted">Proportional Estimated Bill:</span>
                <span className="font-bold text-emerald-800">{formatCurrency(inspectAppliance.costEstimate)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brand-muted">Associated Grid Emissions:</span>
                <span className="font-bold text-brand-dark">{formatCo2(inspectAppliance.carbonKg)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button size="sm" onClick={() => setInspectAppliance(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
