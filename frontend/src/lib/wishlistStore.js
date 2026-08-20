import { create } from "zustand";

export const useWishlistStore = create((set) => ({
  wishlist: [],
  setWishlist: (wishlist) => set({ wishlist }),
  clearWishlist: () => set({ wishlist: [] }),
}));