import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { api } from '../lib/api';
import { auth, 
  signInWithGoogle as firebaseSignInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail,
  signOut as firebaseSignOut 
} from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { detectCurrency } from '../lib/currency';
import type { CreditsInfo } from '../types';

export function useAuth() {
  const { user, credits, isAuthLoading, setUser, setCredits, setAuthLoading, setCurrency } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u);
      if (u) {
        try {
          // Force token refresh and use it directly to avoid race conditions
          const token = await u.getIdToken(true);
          const { data } = await api.post<{ credits: CreditsInfo }>('/api/auth/sync', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCredits(data.credits);
          setCurrency(data.credits.currency ?? detectCurrency());
        } catch (err: any) {
          console.error('[AUTH_SYNC_ERROR]', err?.response?.status, err?.message);
          console.log('Target API URL:', import.meta.env.VITE_API_URL || 'http://localhost:4000 (default)');
          try {
            const cr = await api.get<CreditsInfo>('/api/credits');
            setCredits(cr.data);
            setCurrency(cr.data.currency ?? detectCurrency());
          } catch (e2) {
            console.error('[CREDITS_FALLBACK_ERROR]', e2);
            setCredits({ freeRemaining: 0, paidCredits: 0, canHarvest: false, resetDate: null, currency: detectCurrency() as any });
            setCurrency(detectCurrency());
          }
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

  return { 
    user, 
    credits, 
    isAuthLoading,
    signIn: signInWithEmail,
    signUp: signUpWithEmail,
    signInWithGoogle: firebaseSignInWithGoogle,
    signOut: firebaseSignOut
  };
}
