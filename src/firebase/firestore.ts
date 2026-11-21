import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { mockFirestore } from './mockFallback';
import {
  Appliance,
  BudgetSettings,
  EmissionsFactor,
  MonthlyRecord,
  TariffSettings,
  UserProfile,
} from '../types';
import { DEFAULT_TARIFF_SETTINGS } from '../utils/calculations';
import { OFFICIAL_EMISSIONS_FACTORS } from '../utils/emissionsData';

// User Profile Service
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured || !db) {
    return mockFirestore.getUserProfile(userId);
  }

  const userDocRef = doc(db, 'users', userId);
  const snap = await getDoc(userDocRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

export async function createUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    await mockFirestore.updateUserProfile(userId, data);
    return;
  }

  const userDocRef = doc(db, 'users', userId);
  const now = new Date().toISOString();
  await setDoc(
    userDocRef,
    {
      id: userId,
      fullName: data.fullName || 'WattWise User',
      email: data.email || '',
      location: data.location || '',
      householdType: data.householdType || 'Apartment',
      householdMembers: data.householdMembers || 3,
      electricityProvider: data.electricityProvider || 'State Electricity Board',
      consumerCategory: data.consumerCategory || 'Domestic (LT-1)',
      preferredBillingPeriod: data.preferredBillingPeriod || '1 Month',
      monthlyBudget: data.monthlyBudget || 2000,
      role: 'user',
      createdAt: now,
      updatedAt: now,
      ...data,
      serverCreatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    await mockFirestore.updateUserProfile(userId, data);
    return;
  }

  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

// Appliances Service
export async function getAppliances(userId: string): Promise<Appliance[]> {
  if (!isFirebaseConfigured || !db) {
    return mockFirestore.getAppliances(userId);
  }

  const colRef = collection(db, 'users', userId, 'appliances');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Appliance[];
}

export async function addAppliance(
  userId: string,
  appliance: Omit<Appliance, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Appliance> {
  if (!isFirebaseConfigured || !db) {
    return mockFirestore.addAppliance(userId, appliance);
  }

  const colRef = collection(db, 'users', userId, 'appliances');
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();
  const newAppliance: Appliance = {
    ...appliance,
    id: newDocRef.id,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, newAppliance);
  return newAppliance;
}

export async function updateAppliance(
  userId: string,
  applianceId: string,
  appliance: Partial<Appliance>
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    await mockFirestore.updateAppliance(userId, applianceId, appliance);
    return;
  }

  const docRef = doc(db, 'users', userId, 'appliances', applianceId);
  await updateDoc(docRef, {
    ...appliance,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteAppliance(userId: string, applianceId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    await mockFirestore.deleteAppliance(userId, applianceId);
    return;
  }

  const docRef = doc(db, 'users', userId, 'appliances', applianceId);
  await deleteDoc(docRef);
}

// Tariff Settings Service
export async function getTariffSettings(userId: string): Promise<TariffSettings> {
  if (!isFirebaseConfigured || !db) {
    return mockFirestore.getTariffSettings(userId);
  }

  const docRef = doc(db, 'users', userId, 'tariffSettings', 'current');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as TariffSettings;
  }

  // Initialize with default
  const defaultTariff: TariffSettings = {
    ...DEFAULT_TARIFF_SETTINGS,
    userId,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(docRef, defaultTariff);
  return defaultTariff;
}

export async function saveTariffSettings(userId: string, settings: TariffSettings): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    await mockFirestore.saveTariffSettings(userId, settings);
    return;
  }

  const docRef = doc(db, 'users', userId, 'tariffSettings', 'current');
  await setDoc(docRef, {
    ...settings,
    userId,
    updatedAt: new Date().toISOString(),
  });
}

// Monthly Records Service
export async function getMonthlyRecords(userId: string): Promise<MonthlyRecord[]> {
  if (!isFirebaseConfigured || !db) {
    return mockFirestore.getMonthlyRecords(userId);
  }

  const colRef = collection(db, 'users', userId, 'monthlyRecords');
  const q = query(colRef, orderBy('periodStart', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as MonthlyRecord[];
}

export async function saveMonthlyRecord(
  userId: string,
  record: Omit<MonthlyRecord, 'id' | 'userId' | 'createdAt'>
): Promise<MonthlyRecord> {
  if (!isFirebaseConfigured || !db) {
    return mockFirestore.saveMonthlyRecord(userId, record);
  }

  const colRef = collection(db, 'users', userId, 'monthlyRecords');
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();
  const newRecord: MonthlyRecord = {
    ...record,
    id: newDocRef.id,
    userId,
    createdAt: now,
  };

  await setDoc(newDocRef, newRecord);
  return newRecord;
}

export async function deleteMonthlyRecord(userId: string, recordId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    await mockFirestore.deleteMonthlyRecord(userId, recordId);
    return;
  }

  const docRef = doc(db, 'users', userId, 'monthlyRecords', recordId);
  await deleteDoc(docRef);
}

// Budget Settings Service
export async function getBudgetSettings(userId: string): Promise<BudgetSettings> {
  if (!isFirebaseConfigured || !db) {
    return mockFirestore.getBudgetSettings(userId);
  }

  const docRef = doc(db, 'users', userId, 'budgetSettings', 'current');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as BudgetSettings;
  }

  const defaultBudget: BudgetSettings = {
    id: 'current',
    userId,
    monthlyBudget: 2000,
    currency: '₹',
    warningThresholds: {
      approaching: 70,
      nearLimit: 90,
      exceeded: 100,
    },
    updatedAt: new Date().toISOString(),
  };
  await setDoc(docRef, defaultBudget);
  return defaultBudget;
}

export async function saveBudgetSettings(userId: string, budget: BudgetSettings): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    await mockFirestore.saveBudgetSettings(userId, budget);
    return;
  }

  const docRef = doc(db, 'users', userId, 'budgetSettings', 'current');
  await setDoc(docRef, {
    ...budget,
    userId,
    updatedAt: new Date().toISOString(),
  });
}

// Emissions Factors Service
export async function getEmissionsFactors(): Promise<EmissionsFactor[]> {
  if (!isFirebaseConfigured || !db) {
    return mockFirestore.getEmissionsFactors();
  }

  try {
    const colRef = collection(db, 'emissionsFactors');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as EmissionsFactor[];
    }
  } catch (err) {
    console.warn('Using official fallback emissions factors:', err);
  }
  return OFFICIAL_EMISSIONS_FACTORS;
}
