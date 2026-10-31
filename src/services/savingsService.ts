import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { SavingsPlan, SavingsTransaction, SavingsFrequency } from '../types';

const PLANS_COL = 'savingsPlans';
const TRANSACTIONS_COL = 'savingsTransactions';

export const savingsService = {
  calculateDepositSchedule(targetAmount: number, durationWeeks: number, frequency: SavingsFrequency) {
    let installmentsCount = durationWeeks;
    if (frequency === 'daily') {
      installmentsCount = durationWeeks * 7;
    } else if (frequency === 'monthly') {
      installmentsCount = Math.max(1, Math.round(durationWeeks / 4));
    }
    const depositAmount = Math.ceil(targetAmount / installmentsCount);
    return {
      installmentsCount,
      depositAmount,
      totalAmount: depositAmount * installmentsCount,
    };
  },

  async createSavingsPlan(params: {
    userId: string;
    userEmail: string;
    userName: string;
    productId: string;
    productName: string;
    productImage: string;
    targetAmount: number;
    durationWeeks: number;
    frequency: SavingsFrequency;
    selectedColor?: string;
    selectedStorage?: string;
  }): Promise<SavingsPlan> {
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const schedule = this.calculateDepositSchedule(params.targetAmount, params.durationWeeks, params.frequency);

    const startDate = new Date();
    const targetDate = new Date();
    targetDate.setDate(startDate.getDate() + params.durationWeeks * 7);

    const nextDate = new Date();
    if (params.frequency === 'daily') nextDate.setDate(startDate.getDate() + 1);
    else if (params.frequency === 'weekly') nextDate.setDate(startDate.getDate() + 7);
    else nextDate.setDate(startDate.getDate() + 30);

    const newPlan: SavingsPlan = {
      id: planId,
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      productId: params.productId,
      productName: params.productName,
      productImage: params.productImage,
      selectedColor: params.selectedColor,
      selectedStorage: params.selectedStorage,
      targetAmount: params.targetAmount,
      savedAmount: 0,
      frequency: params.frequency,
      durationWeeks: params.durationWeeks,
      depositAmount: schedule.depositAmount,
      startDate: startDate.toISOString(),
      targetDate: targetDate.toISOString(),
      nextExpectedDepositDate: nextDate.toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, PLANS_COL, planId), newPlan);
      return newPlan;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${PLANS_COL}/${planId}`);
      return newPlan;
    }
  },

  async getUserPlans(userId: string): Promise<SavingsPlan[]> {
    try {
      const q = query(collection(db, PLANS_COL), where('userId', '==', userId));
      const snap = await getDocs(q);
      const plans = snap.docs.map(d => ({ ...d.data(), id: d.id } as SavingsPlan));
      return plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Error fetching user savings plans:', err);
      return [];
    }
  },

  async getAllPlans(): Promise<SavingsPlan[]> {
    try {
      const snap = await getDocs(collection(db, PLANS_COL));
      const plans = snap.docs.map(d => ({ ...d.data(), id: d.id } as SavingsPlan));
      return plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Admin fetching plans fallback:', err);
      return [];
    }
  },

  async recordDeposit(params: {
    planId: string;
    userId: string;
    amount: number;
    paymentMethod: 'bank_transfer' | 'online_gateway' | 'card';
    reference: string;
    proofOfPaymentUrl?: string;
    autoVerify?: boolean;
  }): Promise<SavingsTransaction> {
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const tx: SavingsTransaction = {
      id: txId,
      planId: params.planId,
      userId: params.userId,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      reference: params.reference,
      proofOfPaymentUrl: params.proofOfPaymentUrl,
      status: params.autoVerify ? 'verified' : 'pending',
      verifiedAt: params.autoVerify ? new Date().toISOString() : undefined,
      verifiedBy: params.autoVerify ? 'Automated Gateway' : undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, TRANSACTIONS_COL, txId), tx);

      // If auto-verified (e.g. online card payment test), immediately increase savedAmount
      if (params.autoVerify) {
        await this.applyVerifiedDeposit(params.planId, params.amount);
      }

      return tx;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${TRANSACTIONS_COL}/${txId}`);
      return tx;
    }
  },

  async applyVerifiedDeposit(planId: string, amount: number): Promise<void> {
    const planRef = doc(db, PLANS_COL, planId);
    const snap = await getDoc(planRef);
    if (snap.exists()) {
      const plan = snap.data() as SavingsPlan;
      const newSaved = (plan.savedAmount || 0) + amount;
      const isCompleted = newSaved >= plan.targetAmount;
      await updateDoc(planRef, {
        savedAmount: newSaved,
        status: isCompleted ? 'completed' : 'active',
        updatedAt: new Date().toISOString(),
      });
    }
  },

  async verifyTransaction(txId: string, verifiedByEmail: string): Promise<void> {
    try {
      const txRef = doc(db, TRANSACTIONS_COL, txId);
      const snap = await getDoc(txRef);
      if (snap.exists()) {
        const tx = snap.data() as SavingsTransaction;
        if (tx.status !== 'verified') {
          await updateDoc(txRef, {
            status: 'verified',
            verifiedBy: verifiedByEmail,
            verifiedAt: new Date().toISOString(),
          });
          await this.applyVerifiedDeposit(tx.planId, tx.amount);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${TRANSACTIONS_COL}/${txId}`);
    }
  },

  async rejectTransaction(txId: string, notes: string): Promise<void> {
    try {
      const txRef = doc(db, TRANSACTIONS_COL, txId);
      await updateDoc(txRef, {
        status: 'rejected',
        notes,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${TRANSACTIONS_COL}/${txId}`);
    }
  },

  async getTransactionsForPlan(planId: string): Promise<SavingsTransaction[]> {
    try {
      const q = query(collection(db, TRANSACTIONS_COL), where('planId', '==', planId));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as SavingsTransaction));
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Error fetching transactions for plan:', err);
      return [];
    }
  },

  async getAllTransactions(): Promise<SavingsTransaction[]> {
    try {
      const snap = await getDocs(collection(db, TRANSACTIONS_COL));
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as SavingsTransaction));
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Admin fetching transactions fallback:', err);
      return [];
    }
  },

  async markPlanConvertedToOrder(planId: string, orderId: string): Promise<void> {
    try {
      await updateDoc(doc(db, PLANS_COL, planId), {
        status: 'converted_to_order',
        orderId,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error marking plan converted:', err);
    }
  },
};
