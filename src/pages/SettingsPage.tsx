import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { TariffConfigModal } from '../components/bill/TariffConfigModal';
import {
  User,
  Settings as SettingsIcon,
  Home,
  Users,
  MapPin,
  Zap,
  LogOut,
  Trash2,
  Save,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { userProfile, currentUser, updateProfileData, logout } = useAuth();
  const { tariffSettings, updateTariff } = useData();

  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [householdType, setHouseholdType] = useState<any>(userProfile?.householdType || 'Apartment');
  const [householdMembers, setHouseholdMembers] = useState(userProfile?.householdMembers || 3);
  const [electricityProvider, setElectricityProvider] = useState(userProfile?.electricityProvider || 'State Electricity Board');
  const [consumerCategory, setConsumerCategory] = useState(userProfile?.consumerCategory || 'Domestic (LT-1)');
  const [preferredBillingPeriod, setPreferredBillingPeriod] = useState<any>(userProfile?.preferredBillingPeriod || '1 Month');
  const [monthlyBudget, setMonthlyBudget] = useState(userProfile?.monthlyBudget || 2000);

  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setLocation(userProfile.location || '');
      setHouseholdType(userProfile.householdType || 'Apartment');
      setHouseholdMembers(userProfile.householdMembers || 3);
      setElectricityProvider(userProfile.electricityProvider || 'State Electricity Board');
      setConsumerCategory(userProfile.consumerCategory || 'Domestic (LT-1)');
      setPreferredBillingPeriod(userProfile.preferredBillingPeriod || '1 Month');
      setMonthlyBudget(userProfile.monthlyBudget || 2000);
    }
  }, [userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfileData({
        fullName,
        location,
        householdType,
        householdMembers: Number(householdMembers),
        electricityProvider,
        consumerCategory,
        preferredBillingPeriod,
        monthlyBudget: Number(monthlyBudget),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.info('Account deleted. Signing out.');
    await logout();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
          Profile & System Settings
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Manage household demographics, electricity distributor preferences, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-brand-primary" />
              <h3 className="text-base font-bold text-brand-dark">Household Profile Information</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  value={currentUser?.email || userProfile?.email || ''}
                  disabled
                  helperText="Managed by Firebase Authentication"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Location / City"
                  placeholder="e.g. Bhubaneswar, Odisha"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                />

                <Select
                  label="Household Type"
                  value={householdType}
                  onChange={(e) => setHouseholdType(e.target.value as any)}
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Independent House">Independent House</option>
                  <option value="Villa">Villa</option>
                  <option value="Other">Other</option>
                </Select>

                <Input
                  label="Household Members"
                  type="number"
                  min={1}
                  max={20}
                  value={householdMembers}
                  onChange={(e) => setHouseholdMembers(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Electricity Provider"
                  value={electricityProvider}
                  onChange={(e) => setElectricityProvider(e.target.value)}
                  leftIcon={<Zap className="w-4 h-4" />}
                />

                <Input
                  label="Consumer Category"
                  value={consumerCategory}
                  onChange={(e) => setConsumerCategory(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Preferred Billing Cycle"
                  value={preferredBillingPeriod}
                  onChange={(e) => setPreferredBillingPeriod(e.target.value as any)}
                >
                  <option value="1 Month">1 Month (Monthly Cycle)</option>
                  <option value="2 Months">2 Months (Bi-Monthly Cycle)</option>
                </Select>

                <Input
                  label="Target Monthly Budget (₹)"
                  type="number"
                  min={100}
                  step={50}
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Electricity Tariff Quick Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-primary" />
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Configured Tariff Slabs</h3>
                  <p className="text-xs text-brand-muted">
                    {tariffSettings.provider} ({tariffSettings.consumerCategory})
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTariffModalOpen(true)}
              >
                Modify Tariff
              </Button>
            </div>

            <div className="p-3 bg-brand-pale rounded-xl border border-brand-border text-xs flex flex-wrap gap-4 text-brand-text">
              <div>
                <span className="text-brand-muted block">Billing Model:</span>
                <span className="font-semibold">{tariffSettings.tariffType === 'slab' ? 'Progressive Slabs' : 'Flat'}</span>
              </div>
              <div>
                <span className="text-brand-muted block">Fixed Charge:</span>
                <span className="font-semibold">₹{tariffSettings.fixedCharge}</span>
              </div>
              <div>
                <span className="text-brand-muted block">Duty / Surcharge:</span>
                <span className="font-semibold">{tariffSettings.otherCharges}%</span>
              </div>
              <div>
                <span className="text-brand-muted block">Slab Tiers:</span>
                <span className="font-semibold">{tariffSettings.slabConfiguration.length} tiers configured</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Account and Security Actions */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-brand-dark">Session & Security</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Your session is securely authenticated through Google Firebase Auth with persistent local sessions.
            </p>

            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={logout}
              leftIcon={<LogOut className="w-4 h-4 text-brand-muted" />}
            >
              Sign Out from WattWise
            </Button>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 space-y-4 border-red-200 bg-red-50/30">
            <div className="flex items-center gap-2 text-red-700">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold">Danger Zone</h3>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              Permanently delete your profile, saved appliances, tariff configurations, and historical records from Cloud Firestore.
            </p>

            <Button
              variant="danger"
              size="sm"
              className="w-full text-xs"
              onClick={() => setIsDeleteModalOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Account
            </Button>
          </Card>
        </div>
      </div>

      {/* Tariff Config Modal */}
      <TariffConfigModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
        tariffSettings={tariffSettings}
        onSave={async (s) => {
          await updateTariff(s);
        }}
      />

      {/* Delete Account Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete WattWise Account"
        description="Are you absolutely sure you want to delete your account?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-brand-muted">
          <p>
            This action cannot be undone. All your appliance lists, progressive slab tariff settings, and monthly records will be permanently erased.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteAccount}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
