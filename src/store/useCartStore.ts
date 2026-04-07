import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, ProductVariant } from "../lib/types";

interface CartState {
  items: CartItem[];
  discount: number; // Percentage (0-100)
  addItem: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => boolean;
  getSummary: () => { 
    subtotal: number; 
    itemsCount: number; 
    shipping: number; 
    discountAmount: number; 
    total: number 
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: 0,
      
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

      clearCart: () => set({ items: [], discount: 0 }),

      applyPromoCode: (code: string) => {
        const uppercaseCode = code.toUpperCase();
        if (uppercaseCode === "TISSU10") {
          set({ discount: 10 });
          return true;
        }
        if (uppercaseCode === "WELCOME20") {
          set({ discount: 20 });
          return true;
        }
        return false;
      },

      getSummary: () => {
        const { items, discount } = get();
        const subtotal = items.reduce(
          (sum, item) => sum + (item.variant.price || item.product.price) * item.quantity,
          0
        );
        const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Mock shipping logic: 5 GEL, free over 150 GEL
        const shipping = subtotal > 150 || subtotal === 0 ? 0 : 5;
        const discountAmount = (subtotal * discount) / 100;
        const total = subtotal + shipping - discountAmount;

        return { subtotal, itemsCount, shipping, discountAmount, total };
      },
    }),
    {
      name: "tissu-cart",
      skipHydration: true,
    }
  )
);
