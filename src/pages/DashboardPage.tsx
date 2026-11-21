import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ApplianceModal } from '../components/appliances/ApplianceModal';
import { formatCurrency, formatKwh, formatCo2, formatPercentage } from '../utils/formatters';
import {
  Zap,
  DollarSign,
  Leaf,
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Calculator,
  ArrowRight,
  Tv,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  History as HistoryIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const {
    appliances,
    monthlyRecords,
    totalHouseholdKwh,
    currentBillResult,
    currentCarbonEmissionsKg,
    applianceSnapshots,
    budgetComparison,
    previousMonthComparison,
    addNewAppliance,
  } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const userName = userProfile?.fullName || currentUser?.displayName || 'Homeowner';
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate highest energy consumer
  const sortedSnapshots = [...applianceSnapshots].sort((a, b) => b.monthlyKwh - a.monthlyKwh);
  const highestConsumer = sortedSnapshots[0] || null;

  // Chart 1 & Chart 3 data: Merge saved monthly records with current projected month
  const historyTrendData = [
    ...monthlyRecords
      .slice(0, 5)
      .reverse()
      .map((rec) => ({
        month: rec.monthName.split(' ')[0],
        fullMonth: rec.monthName,
        kwh: rec.totalKwh,
        cost: rec.estimatedBill,
        emissions: rec.carbonEmissionsKg,
      })),
    {
      month: `${currentDate.split(' ')[0]} (Cur)`,
      fullMonth: `${currentDate} (Projected)`,
      kwh: totalHouseholdKwh,
      cost: currentBillResult.totalEstimatedBill,
      emissions: currentCarbonEmissionsKg,
    },
  ];

  // Chart 2 data: Appliance breakdown donut
  const pieData = sortedSnapshots.slice(0, 5).map((snap) => ({
    name: snap.applianceName,
    value: snap.monthlyKwh,
    percent: snap.percentageShare,
  }));

  const remainingKwh = sortedSnapshots.slice(5).reduce((sum, item) => sum + item.monthlyKwh, 0);
  if (remainingKwh > 0) {
    const total = totalHouseholdKwh || 1;
    pieData.push({
      name: 'Other Appliances',
      value: Math.round(remainingKwh * 10) / 10,
      percent: Math.round((remainingKwh / total) * 1000) / 10,
    });
  }

  // Shades of green palette for charts
  const CHART_GREEN_COLORS = ['#16845B', '#105B40', '#38A169', '#48BB78', '#68D391', '#9AE6B4'];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-sm text-brand-muted mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand-primary" />
            <span>Here&apos;s your household energy overview for {currentDate}.</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Appliance
          </Button>
          <Link to="/bill-calculator">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Calculator className="w-4 h-4 text-brand-primary" />}
            >
              Calculate Bill
            </Button>
          </Link>
        </div>
      </div>

      {/* Empty State if No Appliances Exist */}
      {appliances.length === 0 ? (
        <EmptyState
          icon={Tv}
          title="Start by adding your household appliances to generate your energy dashboard."
          description="WattWise requires at least one appliance to compute monthly energy consumption, electricity bills, carbon footprint and budget tracking."
          actionLabel="Add Your First Appliance"
          onAction={() => setIsAddModalOpen(true)}
          actionIcon={<Plus className="w-4 h-4" />}
        />
      ) : (
        <>
          {/* Summary Cards Grid (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Monthly Electricity Consumption */}
            <Card className="p-5 space-y-3 relative overflow-hidden" hoverEffect>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                  Monthly Consumption
                </span>
                <div className="w-9 h-9 rounded-xl bg-brand-light text-brand-primary flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-brand-dark">
                {formatKwh(totalHouseholdKwh)}
              </div>
              <div className="text-xs flex items-center gap-1.5 pt-1 border-t border-brand-border/60">
                {previousMonthComparison.previousRecord ? (
                  <>
                    {previousMonthComparison.kwhDiff >= 0 ? (
                      <span className="text-amber-700 flex items-center font-bold">
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                        {formatPercentage(previousMonthComparison.kwhPercent)}
                      </span>
                    ) : (
                      <span className="text-brand-primary flex items-center font-bold">
                        <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                        {formatPercentage(previousMonthComparison.kwhPercent)}
                      </span>
                    )}
                    <span className="text-brand-muted truncate">
                      vs prev month ({formatKwh(previousMonthComparison.previousRecord.totalKwh)})
                    </span>
                  </>
                ) : (
                  <span className="text-brand-muted">Baseline projection month</span>
                )}
              </div>
            </Card>

            {/* Card 2: Estimated Electricity Bill */}
            <Card className="p-5 space-y-3 relative overflow-hidden" hoverEffect>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                  Estimated Monthly Bill
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-800">
                {formatCurrency(currentBillResult.totalEstimatedBill)}
              </div>
              <div className="text-xs flex items-center gap-1.5 pt-1 border-t border-brand-border/60">
                {previousMonthComparison.previousRecord ? (
                  <>
                    {previousMonthComparison.costDiff >= 0 ? (
                      <span className="text-amber-700 flex items-center font-bold">
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                        {formatCurrency(previousMonthComparison.costDiff)}
                      </span>
                    ) : (
                      <span className="text-brand-primary flex items-center font-bold">
                        <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                        -{formatCurrency(Math.abs(previousMonthComparison.costDiff))}
                      </span>
                    )}
                    <span className="text-brand-muted truncate">
                      vs prev ({formatCurrency(previousMonthComparison.previousRecord.estimatedBill)})
                    </span>
                  </>
                ) : (
                  <span className="text-brand-muted">Calculated on slab tariff</span>
                )}
              </div>
            </Card>

            {/* Card 3: Carbon Footprint */}
            <Card className="p-5 space-y-3 relative overflow-hidden" hoverEffect>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                  Carbon Footprint
                </span>
                <div className="w-9 h-9 rounded-xl bg-brand-light text-brand-primary flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-brand-dark">
                {formatCo2(currentCarbonEmissionsKg)}
              </div>
              <div className="text-xs flex items-center gap-1.5 pt-1 border-t border-brand-border/60">
                {previousMonthComparison.previousRecord ? (
                  <>
                    {previousMonthComparison.carbonDiff >= 0 ? (
                      <span className="text-amber-700 flex items-center font-bold">
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                        {formatPercentage(previousMonthComparison.carbonPercent)}
                      </span>
                    ) : (
                      <span className="text-brand-primary flex items-center font-bold">
                        <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                        {formatPercentage(previousMonthComparison.carbonPercent)}
                      </span>
                    )}
                    <span className="text-brand-muted truncate">
                      vs prev ({formatCo2(previousMonthComparison.previousRecord.carbonEmissionsKg)})
                    </span>
                  </>
                ) : (
                  <span className="text-brand-muted">Grid factor: 0.716 kg/kWh</span>
                )}
              </div>
            </Card>

            {/* Card 4: Budget Status */}
            <Card className="p-5 space-y-3 relative overflow-hidden" hoverEffect>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                  Budget Status
                </span>
                <div className="w-9 h-9 rounded-xl bg-brand-pale text-brand-primary flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-extrabold text-brand-dark">
                  {budgetComparison.percentage}%
                </div>
                <Badge
                  variant={
                    budgetComparison.status === 'exceeded'
                      ? 'danger'
                      : budgetComparison.status === 'nearLimit'
                      ? 'warning'
                      : 'success'
                  }
                  size="sm"
                >
                  {budgetComparison.status === 'exceeded'
                    ? 'Exceeded'
                    : budgetComparison.status === 'nearLimit'
                    ? 'Near Limit'
                    : 'On Track'}
                </Badge>
              </div>
              <div className="text-xs text-brand-muted pt-1 border-t border-brand-border/60 flex justify-between">
                <span>Budget: {formatCurrency(budgetComparison.budget)}</span>
                <span className="font-semibold text-brand-dark">
                  {budgetComparison.remaining > 0
                    ? `${formatCurrency(budgetComparison.remaining)} left`
                    : 'Over budget'}
                </span>
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Monthly Electricity Consumption (Line Chart) */}
            <Card className="lg:col-span-2 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-brand-dark">
                    Monthly Electricity Consumption Trend
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Historical units in kWh alongside current projection
                  </p>
                </div>
                <Badge variant="info">kWh units</Badge>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E1EAE3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64746B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64746B' }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} kWh`, 'Consumption']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        borderColor: '#E1EAE3',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="kwh"
                      stroke="#16845B"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#16845B', stroke: '#FFFFFF', strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: '#105B40' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 2: Appliance-wise Donut Chart */}
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-brand-dark">
                  Appliance Consumption Share
                </h3>
                <p className="text-xs text-brand-muted">
                  Percentage contribution by appliance
                </p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_GREEN_COLORS[index % CHART_GREEN_COLORS.length]}
                          />
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
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-brand-muted">No appliance data</p>
                )}
              </div>
            </Card>
          </div>

          {/* Chart 3 & Insights Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 3: Monthly Electricity Cost Bar Chart */}
            <Card className="lg:col-span-2 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-brand-dark">
                    Monthly Electricity Cost Comparison
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Estimated spending in ₹ compared with monthly budget
                  </p>
                </div>
                <Badge variant="neutral">₹ Currency</Badge>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E1EAE3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64746B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64746B' }} />
                    <Tooltip
                      formatter={(val: any) => [`₹${val}`, 'Electricity Cost']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        borderColor: '#E1EAE3',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="cost" fill="#38A169" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Highest Energy Consumer & Insight Card */}
            <div className="space-y-6">
              {highestConsumer ? (
                <Card className="p-6 space-y-4 bg-brand-pale border-brand-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center">
                      <Zap className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                        Highest Energy Consumer
                      </span>
                      <h4 className="text-sm font-bold text-brand-dark">
                        {highestConsumer.applianceName}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-brand-muted">
                      <span>Monthly Consumption:</span>
                      <span className="font-bold text-brand-dark">
                        {formatKwh(highestConsumer.monthlyKwh)} ({highestConsumer.percentageShare}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-brand-muted">
                      <span>Estimated Monthly Cost:</span>
                      <span className="font-bold text-emerald-800">
                        {formatCurrency(highestConsumer.costEstimate)}
                      </span>
                    </div>
                    <div className="flex justify-between text-brand-muted">
                      <span>Carbon Footprint:</span>
                      <span className="font-bold text-brand-dark">
                        {formatCo2(highestConsumer.carbonKg)}
                      </span>
                    </div>
                  </div>

                  <Link to="/energy-tips" className="block pt-1">
                    <Button variant="light" size="sm" className="w-full text-xs">
                      View Energy Saving Tips
                    </Button>
                  </Link>
                </Card>
              ) : null}

              {/* Data-driven Energy Insight */}
              <Card className="p-5 space-y-3 border-brand-border">
                <div className="flex items-center gap-2 text-brand-dark">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h4 className="text-sm font-bold">Energy Insight</h4>
                </div>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {highestConsumer && highestConsumer.percentageShare > 35
                    ? `${highestConsumer.applianceName} accounts for ${highestConsumer.percentageShare}% of your total electricity consumption. Trimming its run time by just 1-2 hours daily will generate noticeable monthly savings.`
                    : budgetComparison.status === 'exceeded'
                    ? `Your projected bill of ${formatCurrency(currentBillResult.totalEstimatedBill)} has exceeded your ${formatCurrency(budgetComparison.budget)} budget. Review your cooling and heating appliances.`
                    : `Your electricity consumption is distributed well across household appliances. Keep monitoring your progressive tariff tiers.`}
                </p>
              </Card>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <Card className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="justify-start py-3"
                onClick={() => setIsAddModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4 text-brand-primary" />}
              >
                Add Appliance
              </Button>
              <Link to="/bill-calculator">
                <Button
                  variant="outline"
                  className="w-full justify-start py-3"
                  leftIcon={<Calculator className="w-4 h-4 text-brand-primary" />}
                >
                  Calculate Bill
                </Button>
              </Link>
              <Link to="/carbon-footprint">
                <Button
                  variant="outline"
                  className="w-full justify-start py-3"
                  leftIcon={<Leaf className="w-4 h-4 text-brand-primary" />}
                >
                  Carbon Footprint
                </Button>
              </Link>
              <Link to="/history">
                <Button
                  variant="outline"
                  className="w-full justify-start py-3"
                  leftIcon={<HistoryIcon className="w-4 h-4 text-brand-primary" />}
                >
                  Monthly History
                </Button>
              </Link>
            </div>
          </Card>
        </>
      )}

      {/* Add Appliance Modal */}
      <ApplianceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data) => {
          await addNewAppliance(data);
        }}
      />
    </div>
  );
};
