import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { CreditsInfo, Currency } from '../types/index.js';

interface AuthStore {
  user: User | null;
  credits: CreditsInfo | null;
  isAuthLoading: boolean;
  isPricingOpen: boolean;
  currency: Currency;
  setUser: (u: User | null) => void;
  setCredits: (c: CreditsInfo | null) => void;
  setAuthLoading: (v: boolean) => void;
  openPricing: () => void;
  closePricing: () => void;
  setCurrency: (c: Currency) => void;
}

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  credits: null,
  isAuthLoading: true,
  isPricingOpen: false,
  currency: 'NGN',
  setUser: user => set({ user }),
  setCredits: credits => set({ credits }),
  setAuthLoading: isAuthLoading => set({ isAuthLoading }),
  openPricing: () => set({ isPricingOpen: true }),
  closePricing: () => set({ isPricingOpen: false }),
  setCurrency: currency => set({ currency }),
}));
