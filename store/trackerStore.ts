import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { secureStore } from './middleware';
import { Preset } from '@/types';

interface TrackerState {
  sessionBase?: number;
  config?: Preset;
  tracePreset?: number;
  setSessionBase: (sessionBase?: number) => void;
  setConfig: (config: Preset) => void;
  setTracePreset: (tracePreset?: number) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      setSessionBase: (sessionBase?: number) => set({ sessionBase }),
      setConfig: (config: Preset) => set({ config }),
      setTracePreset: (tracePreset?: number) => set({ tracePreset }),
    }),
    {
      name: 'tracker-secure-storage',
      storage: secureStore,
    },
  ),
);
