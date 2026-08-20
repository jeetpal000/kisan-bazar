import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  isHydrated: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setHydrated: (value) => set({ isHydrated: value }),
}));
