import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, SavedAddress } from '../types';

const ADMIN_EMAIL = 'usitakatelvin@gmail.com';
const USERS_COL = 'users';
const ADMINS_COL = 'admins';

export const authService = {
  isAdminEmail(email?: string | null): boolean {
    if (!email) return false;
    return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, USERS_COL, uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch {
      return null;
    }
  },

  async createUserProfile(firebaseUser: FirebaseUser, extraData?: { fullName?: string; phone?: string; role?: 'customer' | 'admin' }): Promise<UserProfile> {
    const isOwnerAdmin = this.isAdminEmail(firebaseUser.email);
    const profile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      fullName: extraData?.fullName || firebaseUser.displayName || 'Customer',
      phone: extraData?.phone || '',
      profilePhotoUrl: firebaseUser.photoURL || '',
      role: isOwnerAdmin ? 'admin' : 'customer',
      savedAddresses: [],
      wishlist: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, USERS_COL, firebaseUser.uid), profile, { merge: true });

      // If admin, also seed admin lookup document
      if (isOwnerAdmin) {
        await setDoc(doc(db, ADMINS_COL, firebaseUser.uid), {
          email: firebaseUser.email,
          role: 'admin',
          grantedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Profile save note:', err);
    }

    return profile;
  },

  async registerWithEmail(email: string, pass: string, fullName: string, phone?: string): Promise<UserProfile> {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (fullName) {
      await updateProfile(cred.user, { displayName: fullName });
    }
    return this.createUserProfile(cred.user, { fullName, phone });
  },

  async loginWithEmail(email: string, pass: string): Promise<UserProfile> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    let profile = await this.getUserProfile(cred.user.uid);
    if (!profile) {
      profile = await this.createUserProfile(cred.user);
    }
    return profile;
  },

  async loginWithGoogle(): Promise<UserProfile> {
    const cred = await signInWithPopup(auth, googleProvider);
    let profile = await this.getUserProfile(cred.user.uid);
    if (!profile) {
      profile = await this.createUserProfile(cred.user);
    }
    return profile;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  async saveAddress(uid: string, address: SavedAddress): Promise<void> {
    const profile = await this.getUserProfile(uid);
    if (!profile) return;
    const existing = profile.savedAddresses || [];
    const updated = [address, ...existing.filter(a => a.id !== address.id)];
    await updateDoc(doc(db, USERS_COL, uid), {
      savedAddresses: updated,
      updatedAt: new Date().toISOString(),
    });
  },

  async toggleWishlist(uid: string, productId: string): Promise<string[]> {
    const profile = await this.getUserProfile(uid);
    if (!profile) return [];
    const wishlist = profile.wishlist || [];
    const next = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];

    await updateDoc(doc(db, USERS_COL, uid), {
      wishlist: next,
      updatedAt: new Date().toISOString(),
    });
    return next;
  },
};
