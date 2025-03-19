import { create } from 'zustand';
import { TrackerMode, TrackerMuscle, TrackerVisual } from '@/enums/Common';
import { Preset } from '@/types';

interface PresetState {
  muscle: TrackerMuscle;
  setMuscle: (mode: TrackerMuscle) => void;
  mode: TrackerMode;
  setMode: (mode: TrackerMode) => void;
  visual: TrackerVisual;
  setVisual: (visual: TrackerVisual) => void;
  name?: string;
  setName: (name: string) => void;
  getPreset: () => Preset;
  setPreset: (preset: Preset) => void;
}

export const usePresetStore = create<PresetState>()((set, get) => ({
  muscle: TrackerMuscle.Biceps,
  setMuscle: (muscle: TrackerMuscle) => set({ muscle }),
  mode: TrackerMode.Strength,
  setMode: (mode: TrackerMode) => set({ mode }),
  visual: TrackerVisual.Off,
  setVisual: (visual: TrackerVisual) => set({ visual }),
  setName: (name: string) => set({ name }),
  setPreset: (preset: Preset) => set(preset),
  getPreset: () => ({
    muscle: get().muscle,
    mode: get().mode,
    visual: get().visual,
    name: get().name,
  }),
}));
