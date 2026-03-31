import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, ProductVariant } from "../lib/types";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getSummary: () => { subtotal: number; itemsCount: number };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, variant, quantity) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.variantId === variant.id && item.productId === product.id
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += quantity;
            return { items: updatedItems };
          }

          const id = `${product.id}-${variant.id}-${Date.now()}`;
          return { items: [...state.items, { id, productId: product.id, variantId: variant.id, product, variant, quantity }] };
        });
      },
      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id: string, quantity: number) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getSummary: () => {
        const items = get().items;
        const subtotal = items.reduce(
          (sum, item) => sum + (item.variant.price || item.product.price) * item.quantity,
          0
        );
        const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
        return { subtotal, itemsCount };
      },
    }),
    {
      name: "tissu-cart",
    }
  )
);
