import { create } from 'zustand';
import type { HarvestMode } from '../types/index';

export interface LogEntry {
  id: string;
  message: string;
  status: 'pending' | 'success' | 'error';
  timestamp: string;
}

interface HarvestStore {
  mode: HarvestMode;
  isHarvesting: boolean;
  logs: LogEntry[];
  jobId: string | null;
  progress: number;
  status: 'pending' | 'running' | 'done' | 'failed';
  currency: 'NGN' | 'USD';
  
  results: any[];
  searchQuery: string;
  
  setMode: (mode: HarvestMode) => void;
  setCurrency: (c: 'NGN' | 'USD') => void;
  setJobId: (id: string | null) => void;
  setProgress: (p: number) => void;
  setResults: (r: any[]) => void;
  setSearchQuery: (q: string) => void;
  setStatus: (s: 'pending' | 'running' | 'done' | 'failed') => void;
  setIsHarvesting: (b: boolean) => void;
  addLog: (message: string, status?: 'pending' | 'success' | 'error') => void;
  clearLogs: () => void;
  startHarvest: () => void;
  stopHarvest: () => void;
}

export const useHarvestStore = create<HarvestStore>((set, get) => ({
  mode: 'leads',
  isHarvesting: false,
  logs: [],
  jobId: null,
  progress: 0,
  status: 'pending',
  currency: 'NGN',
  results: [],
  searchQuery: '',

  setMode: (mode) => set({ mode }),
  setCurrency: (currency: 'NGN' | 'USD') => set({ currency }),
  setJobId: (jobId) => set({ jobId }),
  setProgress: (progress) => set({ progress }),
  setResults: (results) => set({ results }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatus: (status: 'pending' | 'running' | 'done' | 'failed') => set({ status }),
  setIsHarvesting: (isHarvesting) => set({ isHarvesting }),

  addLog: (message, status = 'success') => set((state) => ({
    logs: [
      ...state.logs,
      {
        id: Math.random().toString(36).substring(7),
        message,
        status,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ]
  })),

  clearLogs: () => set({ logs: [] }),
  
  startHarvest: () => {
    // Legacy function unused
  },

  stopHarvest: () => set({ isHarvesting: false, progress: 100 }),
}));
