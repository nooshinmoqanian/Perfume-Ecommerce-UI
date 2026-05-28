import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "edos_cart_v1";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const value = localStorage.getItem(CART_KEY);
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors.
    }
  }, [items]);

  const api = useMemo(
    () => ({
      items,
      add: (item, quantity = 1) => {
        setItems((prev) => {
          const existing = prev.find((entry) => entry.productId === item.productId);
          if (!existing) {
            return [{ ...item, quantity }, ...prev];
          }
          return prev.map((entry) =>
            entry.productId === item.productId
              ? { ...entry, quantity: entry.quantity + quantity }
              : entry
          );
        });
      },
      remove: (productId) => {
        setItems((prev) => prev.filter((entry) => entry.productId !== productId));
      },
      update: (productId, quantity) => {
        setItems((prev) =>
          prev.map((entry) =>
            entry.productId === productId
              ? { ...entry, quantity: Math.max(1, quantity) }
              : entry
          )
        );
      },
      clear: () => setItems([]),
      total: () =>
        items.reduce((sum, entry) => sum + Number(entry.price || 0) * Number(entry.quantity || 0), 0),
    }),
    [items]
  );

  return createElement(CartContext.Provider, { value: api }, children);
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
