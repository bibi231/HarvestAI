import { useAuthStore } from '../store/authStore.js';
import { api } from '../lib/api.js';
import type { CreditsInfo } from '../types/index.js';

export function useCredits() {
  const { credits, setCredits } = useAuthStore();

  async function refreshCredits() {
    try {
      const { data } = await api.get<CreditsInfo>('/api/credits');
      setCredits(data);
    } catch {}
  }

  return { credits, refreshCredits };
}
