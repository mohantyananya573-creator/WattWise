import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuthUser,
  loginUser,
  logoutUser,
  registerUser,
  sendPasswordReset,
  subscribeToAuthChanges,
} from '../firebase/auth';
import { createUserProfile, getUserProfile, updateUserProfile } from '../firebase/firestore';
import { isFirebaseConfigured } from '../firebase/firebaseConfig';
import { UserProfile } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isFirebaseConfigured: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          let profile = await getUserProfile(user.uid);
          if (!profile) {
            await createUserProfile(user.uid, {
              fullName: user.displayName || 'WattWise User',
              email: user.email || '',
            });
            profile = await getUserProfile(user.uid);
          }
          setUserProfile(profile);
        } catch (err) {
          console.error('Failed to load profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const user = await loginUser(email, pass);
      setCurrentUser(user);
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      toast.success('Logged in successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, fullName: string) => {
    setIsLoading(true);
    try {
      const user = await registerUser(email, pass, fullName);
      setCurrentUser(user);
      await createUserProfile(user.uid, {
        fullName,
        email,
      });
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      toast.success('Account created successfully! Welcome to WattWise.');
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserProfile(null);
      toast.info('You have logged out.');
    } catch (err: any) {
      toast.error('Logout error: ' + err?.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordReset(email);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send reset email.');
      throw err;
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      await updateUserProfile(currentUser.uid, data);
      setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
      toast.success('Profile updated successfully.');
    } catch (err: any) {
      toast.error('Failed to update profile: ' + err?.message);
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    const profile = await getUserProfile(currentUser.uid);
    setUserProfile(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isLoading,
        isFirebaseConfigured,
        login,
        register,
        logout,
        resetPassword,
        updateProfileData,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
