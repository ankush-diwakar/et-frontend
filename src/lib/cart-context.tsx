import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Bowl } from "@/data/menu";

export interface CartItem {
  bowl: Bowl;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  addItem: (bowl: Bowl) => void;
  removeItem: (bowlId: string) => void;
  updateQuantity: (bowlId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((bowl: Bowl) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.bowl.id === bowl.id);
      if (existing) {
        return prev.map((i) =>
          i.bowl.id === bowl.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { bowl, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((bowlId: string) => {
    setItems((prev) => prev.filter((i) => i.bowl.id !== bowlId));
  }, []);

  const updateQuantity = useCallback((bowlId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.bowl.id !== bowlId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.bowl.id === bowlId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setIsOpen(false);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + (i.bowl.price ?? 0) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen((v) => !v),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
