import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { Product } from "@/lib/shop";

export type CartLine = {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
  total: number;
};

const STORAGE_KEY = "tuc-shop-cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore malformed cart */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable */
    }
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    const add: CartContextValue["add"] = (product, quantity = 1) =>
      setLines((prev) => {
        const existing = prev.find((line) => line.product_id === product.id);
        if (existing) {
          return prev.map((line) =>
            line.product_id === product.id
              ? { ...line, quantity: Math.min(line.quantity + quantity, product.stock_quantity) }
              : line,
          );
        }
        return [
          ...prev,
          {
            product_id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: Math.min(quantity, product.stock_quantity),
          },
        ];
      });

    return {
      lines,
      add,
      setQuantity: (productId, quantity) =>
        setLines((prev) =>
          quantity <= 0
            ? prev.filter((line) => line.product_id !== productId)
            : prev.map((line) =>
                line.product_id === productId ? { ...line, quantity } : line,
              ),
        ),
      remove: (productId) => setLines((prev) => prev.filter((l) => l.product_id !== productId)),
      clear: () => setLines([]),
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      total: lines.reduce((sum, line) => sum + line.quantity * line.price, 0),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
