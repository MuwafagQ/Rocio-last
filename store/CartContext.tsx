import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product, SubscriptionFrequency } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  toggleSubscription: (productId: string) => void;
  updateSubscriptionFrequency: (productId: string, frequency: SubscriptionFrequency) => void;
  clearCart: () => void;
  subtotal: number;
  savings: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1, isSubscribed: false }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems((prev) => {
      return prev.map((item) => {
        if (item.id === productId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const toggleSubscription = (productId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId 
          ? { 
              ...item, 
              isSubscribed: !item.isSubscribed,
              subscriptionFrequency: !item.isSubscribed ? 'weekly' : undefined 
            } 
          : item
      )
    );
  };

  const updateSubscriptionFrequency = (productId: string, frequency: SubscriptionFrequency) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, subscriptionFrequency: frequency } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => {
    const itemPrice = Number(item.price || 0);
    const price = item.isSubscribed ? itemPrice * 0.9 : itemPrice; // 10% off if subscribed
    return sum + price * item.quantity;
  }, 0);

  const savings = items.reduce((sum, item) => {
    if (item.isSubscribed) {
      return sum + (Number(item.price || 0) * 0.1 * item.quantity);
    }
    return sum;
  }, 0);

  return (
    <CartContext.Provider
      value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        toggleSubscription, 
        updateSubscriptionFrequency,
        clearCart, 
        subtotal,
        savings 
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