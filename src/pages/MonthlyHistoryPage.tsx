import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { MonthlyRecord } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency, formatKwh, formatCo2, formatPercentage } from '../utils/formatters';
import {
  History as HistoryIcon,
  Calendar,
  Calculator,
  Trash2,
  Eye,
  GitCompare,
  ArrowUpDown,
  Search,
  Zap,
  DollarSign,
  Leaf,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const MonthlyHistoryPage: React.FC = () => {
  const { monthlyRecords, removeRecord } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'date' | 'cost' | 'kwh'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedRecordForView, setSelectedRecordForView] = useState<MonthlyRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<MonthlyRecord | null>(null);

  // Comparison State
  const [compareMonthAId, setCompareMonthAId] = useState<string>(
    monthlyRecords[0]?.id || ''
  );
  const [compareMonthBId, setCompareMonthBId] = useState<string>(
    monthlyRecords[1]?.id || ''
  );

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    return monthlyRecords
      .filter((rec) =>
        rec.monthName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'date') {
          diff = new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime();
        } else if (sortField === 'cost') {
          diff = a.estimatedBill - b.estimatedBill;
        } else if (sortField === 'kwh') {
          diff = a.totalKwh - b.totalKwh;
        }
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [monthlyRecords, searchTerm, sortField, sortOrder]);

  const recordA = monthlyRecords.find((r) => r.id === compareMonthAId) || null;
  const recordB = monthlyRecords.find((r) => r.id === compareMonthBId) || null;

  const comparisonDiff = useMemo(() => {
    if (!recordA || !recordB) return null;

    const kwhDiff = recordA.totalKwh - recordB.totalKwh;
    const kwhPct = recordB.totalKwh > 0 ? (kwhDiff / recordB.totalKwh) * 100 : 0;

    const costDiff = recordA.estimatedBill - recordB.estimatedBill;
    const costPct = recordB.estimatedBill > 0 ? (costDiff / recordB.estimatedBill) * 100 : 0;

    const carbonDiff = recordA.carbonEmissionsKg - recordB.carbonEmissionsKg;
    const carbonPct = recordB.carbonEmissionsKg > 0 ? (carbonDiff / recordB.carbonEmissionsKg) * 100 : 0;

    return {
      kwhDiff: Math.round(kwhDiff * 10) / 10,
      kwhPct: Math.round(kwhPct * 10) / 10,
      costDiff: Math.round(costDiff * 100) / 100,
      costPct: Math.round(costPct * 10) / 10,
      carbonDiff: Math.round(carbonDiff * 10) / 10,
      carbonPct: Math.round(carbonPct * 10) / 10,
    };
  }, [recordA, recordB]);

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    await removeRecord(recordToDelete.id);
    setRecordToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
            Monthly History & Records
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Historical calculation snapshots, period-over-period comparisons, and archived appliance states.
          </p>
        </div>

        <Link to="/bill-calculator">
          <Button size="sm" leftIcon={<Calculator className="w-4 h-4" />}>
            Calculate New Bill
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      {monthlyRecords.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No saved monthly records available."
          description="Save calculations from the Electricity Bill Predictor to establish your multi-month historical records."
          actionLabel="Calculate Your First Bill"
          onAction={() => {}}
          actionIcon={<Calculator className="w-4 h-4" />}
        />
      ) : (
        <>
          {/* Side-by-Side Comparison Module */}
          {monthlyRecords.length >= 2 && (
            <Card className="p-6 bg-brand-pale border-brand-border space-y-5">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-brand-primary" />
                <div>
                  <h3 className="text-base font-bold text-brand-dark">
                    Compare Two Billing Periods
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Evaluate differences in units, cost, and carbon emissions between saved months
                  </p>
                </div>
              </div>

              {/* Selector Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                    Target Period (Month A)
                  </label>
                  <select
                    value={compareMonthAId}
                    onChange={(e) => setCompareMonthAId(e.target.value)}
                    className="w-full text-xs font-bold border border-brand-border rounded-xl px-3 py-2.5 bg-white text-brand-dark"
                  >
                    {monthlyRecords.map((rec) => (
                      <option key={rec.id} value={rec.id}>
                        {rec.monthName} ({formatCurrency(rec.estimatedBill)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                    Baseline Period (Month B)
                  </label>
                  <select
                    value={compareMonthBId}
                    onChange={(e) => setCompareMonthBId(e.target.value)}
                    className="w-full text-xs font-bold border border-brand-border rounded-xl px-3 py-2.5 bg-white text-brand-dark"
                  >
                    {monthlyRecords.map((rec) => (
                      <option key={rec.id} value={rec.id}>
                        {rec.monthName} ({formatCurrency(rec.estimatedBill)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Diff Stats */}
              {comparisonDiff && recordA && recordB && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-white rounded-xl border border-brand-border text-center space-y-1">
                    <span className="text-[11px] font-semibold text-brand-muted uppercase">
                      Consumption Difference
                    </span>
                    <div className="text-xl font-extrabold text-brand-dark">
                      {formatKwh(Math.abs(comparisonDiff.kwhDiff))}
                    </div>
                    <div className="text-xs">
                      <Badge variant={comparisonDiff.kwhDiff <= 0 ? 'success' : 'warning'} size="sm">
                        {formatPercentage(comparisonDiff.kwhPct)}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-brand-border text-center space-y-1">
                    <span className="text-[11px] font-semibold text-brand-muted uppercase">
                      Cost Difference
                    </span>
                    <div className="text-xl font-extrabold text-emerald-800">
                      {formatCurrency(Math.abs(comparisonDiff.costDiff))}
                    </div>
                    <div className="text-xs">
                      <Badge variant={comparisonDiff.costDiff <= 0 ? 'success' : 'warning'} size="sm">
                        {formatPercentage(comparisonDiff.costPct)}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-brand-border text-center space-y-1">
                    <span className="text-[11px] font-semibold text-brand-muted uppercase">
                      Emissions Difference
                    </span>
                    <div className="text-xl font-extrabold text-brand-dark">
                      {formatCo2(Math.abs(comparisonDiff.carbonDiff))}
                    </div>
                    <div className="text-xs">
                      <Badge variant={comparisonDiff.carbonDiff <= 0 ? 'success' : 'warning'} size="sm">
                        {formatPercentage(comparisonDiff.carbonPct)}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Records Table and Filter Controls */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="w-full sm:w-72">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-brand-muted" />
                  <input
                    type="text"
                    placeholder="Search by month or year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-brand-border rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as any)}
                  className="text-xs border border-brand-border rounded-xl px-3 py-2 bg-white text-brand-text"
                >
                  <option value="date">Sort by Date</option>
                  <option value="cost">Sort by Bill Amount</option>
                  <option value="kwh">Sort by Consumption</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-brand-border rounded-xl bg-white hover:bg-brand-pale text-brand-muted"
                  title="Toggle Ascending / Descending"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Billing Period</th>
                    <th className="py-3 text-right">Units (kWh)</th>
                    <th className="py-3 text-right">Estimated Bill</th>
                    <th className="py-3 text-right">Carbon (kg CO₂e)</th>
                    <th className="py-3 text-right">Saved Date</th>
                    <th className="py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-brand-pale/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-brand-dark text-sm">{rec.monthName}</div>
                        <div className="text-[11px] text-brand-muted">
                          {rec.periodStart} to {rec.periodEnd}
                        </div>
                      </td>
                      <td className="py-3.5 text-right font-bold text-brand-dark">
                        {formatKwh(rec.totalKwh)}
                      </td>
                      <td className="py-3.5 text-right font-extrabold text-emerald-800">
                        {formatCurrency(rec.estimatedBill)}
                      </td>
                      <td className="py-3.5 text-right font-medium text-brand-text">
                        {formatCo2(rec.carbonEmissionsKg)}
                      </td>
                      <td className="py-3.5 text-right text-brand-muted">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedRecordForView(rec)}
                            className="p-1.5 rounded-lg text-brand-primary hover:bg-brand-light transition-colors"
                            title="View Calculation Snapshot"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRecordToDelete(rec)}
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* View Historical Details Modal */}
      <Modal
        isOpen={Boolean(selectedRecordForView)}
        onClose={() => setSelectedRecordForView(null)}
        title={selectedRecordForView?.monthName || 'Monthly Record Details'}
        description={`Archived calculation snapshot (${selectedRecordForView?.periodStart} to ${selectedRecordForView?.periodEnd})`}
        maxWidth="lg"
      >
        {selectedRecordForView && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-brand-pale p-3.5 rounded-xl border border-brand-border text-center">
              <div>
                <span className="text-brand-muted block">Total Units</span>
                <span className="font-extrabold text-brand-dark text-sm">
                  {formatKwh(selectedRecordForView.totalKwh)}
                </span>
              </div>
              <div>
                <span className="text-brand-muted block">Total Bill</span>
                <span className="font-extrabold text-emerald-800 text-sm">
                  {formatCurrency(selectedRecordForView.estimatedBill)}
                </span>
              </div>
              <div>
                <span className="text-brand-muted block">Carbon Footprint</span>
                <span className="font-extrabold text-brand-dark text-sm">
                  {formatCo2(selectedRecordForView.carbonEmissionsKg)}
                </span>
              </div>
              <div>
                <span className="text-brand-muted block">Active Budget</span>
                <span className="font-extrabold text-brand-dark text-sm">
                  {formatCurrency(selectedRecordForView.monthlyBudget)}
                </span>
              </div>
            </div>

            {/* Itemized charges */}
            <div className="space-y-1.5 pt-2 border-t border-brand-border">
              <h4 className="font-bold text-brand-dark">Monetary Tariff Breakdown:</h4>
              <div className="flex justify-between py-1 border-b border-brand-border/40 text-brand-muted">
                <span>Energy Charges:</span>
                <span className="font-semibold text-brand-dark">
                  {formatCurrency(selectedRecordForView.energyCharges)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border/40 text-brand-muted">
                <span>Fixed Connected Load Charge:</span>
                <span className="font-semibold text-brand-dark">
                  {formatCurrency(selectedRecordForView.fixedCharge)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border/40 text-brand-muted">
                <span>Taxes & Duties:</span>
                <span className="font-semibold text-brand-dark">
                  {formatCurrency(selectedRecordForView.otherCharges)}
                </span>
              </div>
              {selectedRecordForView.credits > 0 && (
                <div className="flex justify-between py-1 border-b border-brand-border/40 text-brand-primary">
                  <span>Rebates / Subsidies:</span>
                  <span className="font-semibold">
                    -{formatCurrency(selectedRecordForView.credits)}
                  </span>
                </div>
              )}
            </div>

            {/* Appliance Snapshots Table */}
            {selectedRecordForView.applianceSnapshots && selectedRecordForView.applianceSnapshots.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-brand-border">
                <h4 className="font-bold text-brand-dark">
                  Appliance Snapshots at Time of Saving:
                </h4>
                <div className="max-h-48 overflow-y-auto border border-brand-border rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-brand-pale text-brand-muted uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Appliance</th>
                        <th className="p-2 text-right">Qty × Watts</th>
                        <th className="p-2 text-right">Units</th>
                        <th className="p-2 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60">
                      {selectedRecordForView.applianceSnapshots.map((snap, i) => (
                        <tr key={i}>
                          <td className="p-2 font-medium text-brand-dark">{snap.applianceName}</td>
                          <td className="p-2 text-right text-brand-muted">
                            {snap.quantity} × {snap.wattage}W
                          </td>
                          <td className="p-2 text-right font-bold text-brand-dark">
                            {formatKwh(snap.monthlyKwh)}
                          </td>
                          <td className="p-2 text-right text-emerald-800">
                            {formatCurrency(snap.costEstimate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <Button size="sm" onClick={() => setSelectedRecordForView(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Record Confirmation Modal */}
      <Modal
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        title="Delete Monthly Record"
        description="Are you sure you want to delete this historical record?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-brand-muted">
            Deleting the record for <strong className="text-brand-dark">{recordToDelete?.monthName}</strong> will permanently remove its historical appliance snapshots and calculations from Firestore.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRecordToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
