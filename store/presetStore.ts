import { create } from 'zustand';
import { TrackerMode, TrackerMuscle, TrackerOptimization } from '@/enums/Common';
import { Preset } from '@/types';

interface PresetState {
  muscle: TrackerMuscle;
  setMuscle: (mode: TrackerMuscle) => void;
  mode: TrackerMode;
  setMode: (mode: TrackerMode) => void;
  optimization: TrackerOptimization;
  setOptimization: (mode: TrackerOptimization) => void;
  name?: string;
  setName: (name: string) => void;
  getPreset: () => Preset;
  setPreset: (preset: Preset) => void;
}

export const usePresetStore = create<PresetState>()((set, get) => ({
  muscle: TrackerMuscle.Biceps,
  setMuscle: (muscle: TrackerMuscle) => set({ muscle }),
  mode: TrackerMode.Blind,
  setMode: (mode: TrackerMode) => set({ mode }),
  optimization: TrackerOptimization.Hypertrophy,
  setOptimization: (optimization: TrackerOptimization) => set({ optimization }),
  setName: (name: string) => set({ name }),
  setPreset: (preset: Preset) => set(preset),
  getPreset: () => ({
    muscle: get().muscle,
    mode: get().mode,
    optimization: get().optimization,
    name: get().name,
  }),
}));
