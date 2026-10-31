import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
  openAuthModal: (mode?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  simulateAdminMode: (enable: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [adminSimulation, setAdminSimulation] = useState<boolean>(() => {
    return localStorage.getItem('neo_admin_preview') === 'true';
  });

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const p = await authService.getUserProfile(auth.currentUser.uid);
      if (p) setProfile(p);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        let p = await authService.getUserProfile(user.uid);
        if (!p) {
          p = await authService.createUserProfile(user);
        }
        setProfile(p);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const logout = async () => {
    await authService.logout();
    setFirebaseUser(null);
    setProfile(null);
  };

  const simulateAdminMode = (enable: boolean) => {
    setAdminSimulation(enable);
    localStorage.setItem('neo_admin_preview', enable ? 'true' : 'false');
  };

  const isRealAdmin = Boolean(
    authService.isAdminEmail(firebaseUser?.email) ||
    profile?.role === 'admin'
  );

  const isAdmin = isRealAdmin || adminSimulation;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        isAdmin,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        logout,
        refreshProfile,
        simulateAdminMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
