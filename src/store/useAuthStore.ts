import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Address, Order } from '@/lib/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setAddressAsDefault: (id: string) => Promise<void>;
  addOrder: (order: Order) => void;
  clearError: () => void;
}

// The server profile endpoint returns the user without an `orders` array
// (orders are tracked client-side, per browser). Guarantee `orders` is always
// an array, and keep any orders already placed in this browser when a fresh
// profile comes back from the server — otherwise a profile refresh would wipe
// the order history and leave `orders` undefined, crashing the Orders tab.
function normalizeUser(fetched: User, prev: User | null): User {
  return { ...fetched, orders: fetched.orders ?? prev?.orders ?? [] };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await authService.login(credentials);
          set((state) => ({ user: normalizeUser(user, state.user), isAuthenticated: true, isLoading: false }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Login failed';
          set({ isLoading: false, error: message });
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await authService.register(data);
          set((state) => ({ user: normalizeUser(user, state.user), isAuthenticated: true, isLoading: false }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Registration failed';
          set({ isLoading: false, error: message });
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          await authService.loginWithGoogle();
          // Redirect happens via Supabase OAuth — state updated on callback
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Google login failed';
          set({ isLoading: false, error: message });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await authService.forgotPassword(email);
          set({ isLoading: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error sending reset link';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      resetPassword: async (password: string) => {
        set({ isLoading: true, error: null });
        try {
          await authService.resetPassword(password);
          set({ isLoading: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error resetting password';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      refreshProfile: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.fetchProfile();
          set((state) => ({ user: normalizeUser(user, state.user), isAuthenticated: true, isLoading: false }));
        } catch {
          // Non-fatal: keep whatever user we already have in the store. A
          // transient network blip or cookie sync race shouldn't sign people
          // out — middleware is the source of truth for protected routes.
          set({ isLoading: false });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true });
        try {
          const updatedUser = await authService.updateProfile(data);
          set({ user: updatedUser, isLoading: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Update failed';
          set({ isLoading: false, error: message });
        }
      },

      addAddress: async (addressData) => {
        set({ isLoading: true });
        try {
          const newAddress = await authService.addAddress(addressData);
          set((state) => {
            if (!state.user) return state;
            let addresses = [...state.user.addresses];
            if (newAddress.isDefault) {
              addresses = addresses.map(a => ({ ...a, isDefault: false }));
            }
            return {
              user: { ...state.user, addresses: [...addresses, newAddress] },
              isLoading: false,
            };
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to add address';
          set({ isLoading: false, error: message });
        }
      },

      removeAddress: async (id) => {
        set({ isLoading: true });
        try {
          await authService.removeAddress(id);
          set((state) => {
            if (!state.user) return state;
            return {
              user: { ...state.user, addresses: state.user.addresses.filter(a => a.id !== id) },
              isLoading: false,
            };
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to remove address';
          set({ isLoading: false, error: message });
        }
      },

      setAddressAsDefault: async (id) => {
        set({ isLoading: true });
        try {
          await authService.setAddressAsDefault(id);
          set((state) => {
            if (!state.user) return state;
            return {
              user: {
                ...state.user,
                addresses: state.user.addresses.map(a => ({ ...a, isDefault: a.id === id })),
              },
              isLoading: false,
            };
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to set default address';
          set({ isLoading: false, error: message });
        }
      },

      addOrder: (order) => {
        set((state) => {
          if (!state.user) return state;
          return { user: { ...state.user, orders: [order, ...(state.user.orders ?? [])] } };
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'tissu-auth-storage',
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
