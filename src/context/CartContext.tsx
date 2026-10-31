import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, FulfillmentType } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, storage?: string) => { success: boolean; message?: string };
  removeFromCart: (productId: string, color?: string, storage?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string, storage?: string) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  fulfillmentType: FulfillmentType;
  setFulfillmentType: (type: FulfillmentType) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  deliveryFee: number;
  totalPrice: number;
}

const STORAGE_KEY = 'neotech_cart_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');
  const [selectedState, setSelectedState] = useState<string>('Lagos Mainland');

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1, color?: string, storage?: string) => {
    const selectedColor = color || product.colors[0] || 'Default';
    const selectedStorage = storage || product.storageOptions[0] || 'Standard';

    // Check stock limit
    const existingIndex = items.findIndex(
      i => i.productId === product.id && i.selectedColor === selectedColor && i.selectedStorage === selectedStorage
    );

    const currentQty = existingIndex >= 0 ? items[existingIndex].quantity : 0;
    const requestedQty = currentQty + quantity;

    if (requestedQty > product.stock) {
      return {
        success: false,
        message: `Only ${product.stock} units in stock. You already have ${currentQty} in cart.`,
      };
    }

    setItems(prev => {
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: requestedQty,
        };
        return copy;
      }
      return [
        ...prev,
        {
          productId: product.id,
          product,
          quantity,
          selectedColor,
          selectedStorage,
        },
      ];
    });

    return { success: true };
  };

  const removeFromCart = (productId: string, color?: string, storage?: string) => {
    setItems(prev => prev.filter(item => {
      if (item.productId !== productId) return true;
      if (color && item.selectedColor !== color) return true;
      if (storage && item.selectedStorage !== storage) return true;
      return false;
    }));
  };

  const updateQuantity = (productId: string, quantity: number, color?: string, storage?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, storage);
      return;
    }

    setItems(prev => prev.map(item => {
      const match = item.productId === productId &&
        (!color || item.selectedColor === color) &&
        (!storage || item.selectedStorage === storage);

      if (match) {
        const safeQty = Math.min(quantity, item.product.stock || 1);
        return { ...item, quantity: safeQty };
      }
      return item;
    }));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // Delivery calculation based on Nigerian states
  const getDeliveryFee = () => {
    if (fulfillmentType === 'pickup' || items.length === 0) return 0;
    switch (selectedState) {
      case 'Lagos Mainland': return 2500;
      case 'Lagos Island': return 3500;
      case 'Abuja (FCT)': return 4500;
      case 'Rivers (Port Harcourt)': return 5000;
      case 'Oyo (Ibadan)': return 4000;
      case 'Ogun': return 3500;
      case 'Delta': return 5000;
      case 'Enugu': return 5000;
      case 'Kano': return 5500;
      default: return 5000;
    }
  };

  const deliveryFee = getDeliveryFee();
  const totalPrice = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
        fulfillmentType,
        setFulfillmentType,
        selectedState,
        setSelectedState,
        deliveryFee,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
