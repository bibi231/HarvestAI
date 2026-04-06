import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase.js';
import { api } from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';
import { detectCurrency } from '../lib/currency.js';
import type { CreditsInfo } from '../types/index.js';

export function useAuth() {
  const { user, credits, isAuthLoading, setUser, setCredits, setAuthLoading, setCurrency } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u);
      if (u) {
        try {
          const { data } = await api.post<{ credits: CreditsInfo }>('/api/auth/sync', {});
          setCredits(data.credits);
          setCurrency(data.credits.currency ?? detectCurrency());
        } catch {
          setCurrency(detectCurrency());
        }
      } else {
        setCredits(null);
      }
      setAuthLoading(false);
    });

    // Listen for insufficient credits event
    const handler = () => useAuthStore.getState().openPricing();
    window.addEventListener('insufficient-credits', handler);

    return () => { unsub(); window.removeEventListener('insufficient-credits', handler); };
  }, []);

  return { user, credits, isAuthLoading };
}
