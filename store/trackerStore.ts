import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { secureStore } from './middleware';
import { Preset } from '@/types';

interface TrackerState {
  sessionBase?: number;
  preset?: Preset;
  presetId?: number;
  setSessionBase: (sessionBase?: number) => void;
  setPreset: (config: Preset) => void;
  setPresetId: (presetId?: number) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      setSessionBase: (sessionBase?: number) => set({ sessionBase }),
      setPreset: (preset: Preset) => set({ preset }),
      setPresetId: (presetId?: number) => set({ presetId }),
    }),
    {
      name: 'tracker-secure-storage',
      storage: secureStore,
    },
  ),
);
