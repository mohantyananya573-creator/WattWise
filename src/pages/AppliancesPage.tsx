import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Appliance, ApplianceCategory } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { ApplianceModal } from '../components/appliances/ApplianceModal';
import { calculateApplianceKwh } from '../utils/calculations';
import { formatKwh } from '../utils/formatters';
import {
  Plus,
  Search,
  Tv,
  Pencil,
  Trash2,
  Sliders,
  AlertCircle,
  Wind,
  Lightbulb,
  Utensils,
  Shirt,
  Flame,
  Zap,
} from 'lucide-react';

export const AppliancesPage: React.FC = () => {
  const { appliances, addNewAppliance, editAppliance, removeAppliance } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null);
  const [deletingAppliance, setDeletingAppliance] = useState<Appliance | null>(null);

  const categories: (ApplianceCategory | 'All')[] = [
    'All',
    'Cooling',
    'Lighting',
    'Kitchen',
    'Entertainment',
    'Washing and Cleaning',
    'Heating',
    'Other',
  ];

  const filteredAppliances = useMemo(() => {
    return appliances.filter((app) => {
      const matchesSearch = app.applianceName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [appliances, searchTerm, selectedCategory]);

  const handleOpenAdd = () => {
    setEditingAppliance(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (app: Appliance) => {
    setEditingAppliance(app);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAppliance) return;
    await removeAppliance(deletingAppliance.id);
    setDeletingAppliance(null);
  };

  const getCategoryIcon = (category: ApplianceCategory) => {
    switch (category) {
      case 'Cooling':
        return <Wind className="w-3.5 h-3.5" />;
      case 'Lighting':
        return <Lightbulb className="w-3.5 h-3.5" />;
      case 'Kitchen':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'Entertainment':
        return <Tv className="w-3.5 h-3.5" />;
      case 'Washing and Cleaning':
        return <Shirt className="w-3.5 h-3.5" />;
      case 'Heating':
        return <Flame className="w-3.5 h-3.5" />;
      default:
        return <Zap className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
            Appliance Management
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Add, calibrate, and track household electrical loads and duty cycles.
          </p>
        </div>

        <Button onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
          Add Appliance
        </Button>
      </div>

      {/* Filter and Search Controls */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search appliances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-primary text-white shadow-2xs'
                    : 'bg-brand-pale text-brand-muted hover:text-brand-dark hover:bg-brand-light/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {filteredAppliances.length === 0 ? (
        <EmptyState
          icon={Tv}
          title={
            appliances.length === 0
              ? "You haven't added any appliances yet."
              : 'No matching appliances found.'
          }
          description={
            appliances.length === 0
              ? 'Add your household electrical appliances to calculate monthly kWh consumption and predict electricity bills.'
              : 'Try clearing your search query or choosing a different category filter.'
          }
          actionLabel={appliances.length === 0 ? 'Add Appliance' : 'Clear Filters'}
          onAction={appliances.length === 0 ? handleOpenAdd : () => { setSearchTerm(''); setSelectedCategory('All'); }}
          actionIcon={appliances.length === 0 ? <Plus className="w-4 h-4" /> : undefined}
        />
      ) : (
        /* Appliance Cards / Responsive Table */
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAppliances.map((app) => {
              const monthlyKwh = calculateApplianceKwh(
                app.wattage,
                app.quantity,
                app.hoursPerDay,
                app.usageDaysPerMonth,
                app.averagePowerAdjustment ?? 1.0
              );

              return (
                <Card
                  key={app.id}
                  hoverEffect
                  className="p-5 space-y-4 border-brand-border flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="neutral" size="sm" className="mb-1.5 gap-1">
                          {getCategoryIcon(app.category)}
                          <span>{app.category}</span>
                        </Badge>
                        <h3 className="font-bold text-brand-dark text-base leading-snug">
                          {app.applianceName}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider block">
                          Monthly
                        </span>
                        <span className="text-base font-extrabold text-brand-primary">
                          {formatKwh(monthlyKwh)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-brand-pale/60 p-2.5 rounded-xl border border-brand-border/60">
                      <div>
                        <span className="text-brand-muted block">Rated Power:</span>
                        <span className="font-semibold text-brand-dark">{app.wattage} W</span>
                      </div>
                      <div>
                        <span className="text-brand-muted block">Quantity:</span>
                        <span className="font-semibold text-brand-dark">{app.quantity} unit(s)</span>
                      </div>
                      <div>
                        <span className="text-brand-muted block">Daily Usage:</span>
                        <span className="font-semibold text-brand-dark">{app.hoursPerDay} hrs/day</span>
                      </div>
                      <div>
                        <span className="text-brand-muted block">Active Days:</span>
                        <span className="font-semibold text-brand-dark">{app.usageDaysPerMonth} days/mo</span>
                      </div>
                    </div>

                    {app.averagePowerAdjustment && app.averagePowerAdjustment < 1.0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-brand-primary bg-brand-light px-2.5 py-1 rounded-lg">
                        <Sliders className="w-3 h-3" />
                        <span>Duty cycle adjustment: {Math.round(app.averagePowerAdjustment * 100)}%</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(app)}
                      leftIcon={<Pencil className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingAppliance(app)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <ApplianceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingAppliance}
        onSubmit={async (data) => {
          if (editingAppliance) {
            await editAppliance(editingAppliance.id, data);
          } else {
            await addNewAppliance(data);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingAppliance)}
        onClose={() => setDeletingAppliance(null)}
        title="Delete Appliance"
        description="Are you sure you want to remove this appliance?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-brand-muted">
            Removing <strong className="text-brand-dark">{deletingAppliance?.applianceName}</strong> will immediately update your monthly consumption and projected electricity bills.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeletingAppliance(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
              Delete Appliance
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
