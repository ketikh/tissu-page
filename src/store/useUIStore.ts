import { create } from "zustand";

interface UIState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  openCart: () => set({ isCartOpen: true, isMobileMenuOpen: false }),
  closeCart: () => set({ isCartOpen: false }),
  openMobileMenu: () => set({ isMobileMenuOpen: true, isCartOpen: false }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));
