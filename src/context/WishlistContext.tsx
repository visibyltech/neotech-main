import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { authService } from '../services/authService';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const STORAGE_KEY = 'neotech_wishlist_v1';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser, profile, refreshProfile } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with user profile when logged in
  useEffect(() => {
    if (profile?.wishlist) {
      setWishlist(profile.wishlist);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile.wishlist));
    }
  }, [profile]);

  const toggleWishlist = async (productId: string) => {
    let next: string[];
    if (wishlist.includes(productId)) {
      next = wishlist.filter(id => id !== productId);
    } else {
      next = [...wishlist, productId];
    }
    setWishlist(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    if (firebaseUser) {
      try {
        await authService.toggleWishlist(firebaseUser.uid, productId);
        await refreshProfile();
      } catch (err) {
        console.warn('Sync wishlist to profile failed:', err);
      }
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
