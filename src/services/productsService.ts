import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Category, Banner } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BANNERS } from './seedData';

const PRODUCTS_COL = 'products';
const CATEGORIES_COL = 'categories';
const BANNERS_COL = 'banners';

export const productsService = {
  // Bootstrap & Seed Database if empty
  async seedInitialDataIfNeeded(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, PRODUCTS_COL));
      if (snap.empty) {
        console.log('Seeding initial products into Firestore...');
        for (const prod of INITIAL_PRODUCTS) {
          await setDoc(doc(db, PRODUCTS_COL, prod.id), prod);
        }
      }

      const catSnap = await getDocs(collection(db, CATEGORIES_COL));
      if (catSnap.empty) {
        for (const cat of INITIAL_CATEGORIES) {
          await setDoc(doc(db, CATEGORIES_COL, cat.id), cat);
        }
      }

      const banSnap = await getDocs(collection(db, BANNERS_COL));
      if (banSnap.empty) {
        for (const ban of INITIAL_BANNERS) {
          await setDoc(doc(db, BANNERS_COL, ban.id), ban);
        }
      }
    } catch (err) {
      console.warn('Initial seeding note (likely permissions or offline):', err);
    }
  },

  async getAllProducts(): Promise<Product[]> {
    try {
      const snap = await getDocs(collection(db, PRODUCTS_COL));
      if (snap.empty) {
        return INITIAL_PRODUCTS;
      }
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
    } catch (err) {
      console.warn('Falling back to local catalog:', err);
      return INITIAL_PRODUCTS;
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const snap = await getDoc(doc(db, PRODUCTS_COL, id));
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as Product;
      }
      return INITIAL_PRODUCTS.find(p => p.id === id) || null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${PRODUCTS_COL}/${id}`);
      return INITIAL_PRODUCTS.find(p => p.id === id) || null;
    }
  },

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const all = await this.getAllProducts();
    return all.filter(p => p.categoryId === categoryId);
  },

  async saveProduct(product: Product): Promise<void> {
    try {
      const prodRef = doc(db, PRODUCTS_COL, product.id);
      await setDoc(prodRef, {
        ...product,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${PRODUCTS_COL}/${product.id}`);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PRODUCTS_COL, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${PRODUCTS_COL}/${id}`);
    }
  },

  async updateStock(id: string, delta: number): Promise<void> {
    try {
      const prodRef = doc(db, PRODUCTS_COL, id);
      const snap = await getDoc(prodRef);
      if (snap.exists()) {
        const curStock = snap.data().stock || 0;
        const newStock = Math.max(0, curStock + delta);
        await updateDoc(prodRef, {
          stock: newStock,
          isAvailable: newStock > 0,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error updating product stock:', err);
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const snap = await getDocs(collection(db, CATEGORIES_COL));
      if (snap.empty) return INITIAL_CATEGORIES;
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Category));
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  // Banners
  async getBanners(): Promise<Banner[]> {
    try {
      const snap = await getDocs(collection(db, BANNERS_COL));
      if (snap.empty) return INITIAL_BANNERS;
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Banner));
      return list.sort((a, b) => a.order - b.order);
    } catch {
      return INITIAL_BANNERS;
    }
  },

  async saveBanner(banner: Banner): Promise<void> {
    try {
      await setDoc(doc(db, BANNERS_COL, banner.id), banner, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${BANNERS_COL}/${banner.id}`);
    }
  },

  async deleteBanner(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, BANNERS_COL, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${BANNERS_COL}/${id}`);
    }
  },
};
