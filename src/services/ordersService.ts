import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { productsService } from './productsService';

const ORDERS_COL = 'orders';

export const ordersService = {
  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'orderStatus' | 'paymentStatus'> & {
    paymentMethod: Order['paymentMethod'];
    proofOfPaymentUrl?: string;
  }): Promise<Order> {
    const timestamp = Date.now();
    const orderNumber = `NTG-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderId = `order_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;

    // Initial statuses
    let initialOrderStatus: OrderStatus = 'Pending Payment';
    let initialPaymentStatus: PaymentStatus = 'pending';

    if (orderData.paymentMethod === 'credably-bnpl') {
      initialOrderStatus = 'Payment Verification';
      initialPaymentStatus = 'verifying';
    } else if (orderData.paymentMethod === 'save-to-buy') {
      initialOrderStatus = 'Confirmed';
      initialPaymentStatus = 'paid';
    } else if (orderData.proofOfPaymentUrl) {
      initialOrderStatus = 'Payment Verification';
      initialPaymentStatus = 'verifying';
    }

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      orderNumber,
      orderStatus: initialOrderStatus,
      paymentStatus: initialPaymentStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, ORDERS_COL, orderId), newOrder);

      // Decrement product stock for ordered items
      for (const item of orderData.items) {
        await productsService.updateStock(item.productId, -item.quantity);
      }

      return newOrder;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${ORDERS_COL}/${orderId}`);
      return newOrder;
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const snap = await getDoc(doc(db, ORDERS_COL, id));
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as Order;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${ORDERS_COL}/${id}`);
      return null;
    }
  },

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const q = query(collection(db, ORDERS_COL), where('orderNumber', '==', orderNumber.trim()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { ...d.data(), id: d.id } as Order;
      }
      return null;
    } catch (err) {
      console.warn('Query by order number fallback:', err);
      return null;
    }
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, ORDERS_COL),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      const orders = snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Error fetching user orders:', err);
      return [];
    }
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const snap = await getDocs(collection(db, ORDERS_COL));
      const orders = snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Admin fetching orders fallback:', err);
      return [];
    }
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    extraUpdates?: {
      trackingNumber?: string;
      notes?: string;
      paymentStatus?: PaymentStatus;
      verifiedBy?: string;
    }
  ): Promise<void> {
    try {
      const orderRef = doc(db, ORDERS_COL, orderId);
      await updateDoc(orderRef, {
        orderStatus: status,
        ...extraUpdates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${ORDERS_COL}/${orderId}`);
    }
  },

  async uploadProofOfPayment(orderId: string, proofUrl: string, paymentReference?: string): Promise<void> {
    try {
      const orderRef = doc(db, ORDERS_COL, orderId);
      await updateDoc(orderRef, {
        proofOfPaymentUrl: proofUrl,
        paymentReference: paymentReference || `REF-${Date.now()}`,
        paymentStatus: 'verifying',
        orderStatus: 'Payment Verification',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${ORDERS_COL}/${orderId}`);
    }
  },
};
