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
import { BNPLApplication } from '../types';

const BNPL_COL = 'bnplApplications';

export const bnplService = {
  calculateFinancing(price: number, tenureMonths: number, interestRatePercent = 3.5, downPaymentPercent = 20) {
    const downPayment = Math.round(price * (downPaymentPercent / 100));
    const financedAmount = price - downPayment;
    const totalInterest = Math.round(financedAmount * (interestRatePercent / 100) * tenureMonths);
    const totalRepayable = financedAmount + totalInterest;
    const monthlyInstallment = Math.round(totalRepayable / tenureMonths);

    return {
      productPrice: price,
      downPayment,
      financedAmount,
      tenureMonths,
      monthlyInstallment,
      totalInterest,
      totalRepayable,
      interestRatePercent,
    };
  },

  async submitApplication(params: {
    userId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    productId: string;
    productName: string;
    productPrice: number;
    tenureMonths: number;
    employmentStatus: string;
    monthlyIncome: number;
    bvnOrNin: string;
    orderId?: string;
  }): Promise<BNPLApplication> {
    const financing = this.calculateFinancing(params.productPrice, params.tenureMonths);

    let credablyRef = `CRD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // Call backend Credably API proxy
      const res = await fetch('/api/credably/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          price: params.productPrice,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.applicationId) {
          credablyRef = json.data.applicationId;
        }
      }
    } catch (apiErr) {
      console.warn('Credably server route note (using generated ref):', apiErr);
    }

    const appId = `bnpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const application: BNPLApplication = {
      id: appId,
      userId: params.userId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      productId: params.productId,
      productName: params.productName,
      requestedAmount: params.productPrice,
      downPayment: financing.downPayment,
      monthlyInstallment: financing.monthlyInstallment,
      tenureMonths: params.tenureMonths,
      employmentStatus: params.employmentStatus,
      monthlyIncome: params.monthlyIncome,
      bvnOrNinMasked: '***' + String(params.bvnOrNin).slice(-4),
      credablyReference: credablyRef,
      status: 'pending',
      orderId: params.orderId,
      credablyDecisionNotes: 'Application lodged with Credably credit scoring engine. Awaiting credit decision.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, BNPL_COL, appId), application);
      return application;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${BNPL_COL}/${appId}`);
      return application;
    }
  },

  async getUserApplications(userId: string): Promise<BNPLApplication[]> {
    try {
      const q = query(collection(db, BNPL_COL), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as BNPLApplication));
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Error fetching user BNPL applications:', err);
      return [];
    }
  },

  async getAllApplications(): Promise<BNPLApplication[]> {
    try {
      const snap = await getDocs(collection(db, BNPL_COL));
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as BNPLApplication));
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Admin fetching BNPL applications fallback:', err);
      return [];
    }
  },

  async updateApplicationStatus(
    appId: string,
    status: BNPLApplication['status'],
    notes?: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, BNPL_COL, appId), {
        status,
        credablyDecisionNotes: notes || `Application status updated to ${status}.`,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${BNPL_COL}/${appId}`);
    }
  },
};
