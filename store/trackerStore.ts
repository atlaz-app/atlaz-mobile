import { create } from "zustand";
import { persist } from "zustand/middleware";
import { secureStore } from "./middleware";
import { TrackerMode } from "@/enums/Common";
import { Preset } from "@/types/components";

interface TrackerState {
  sessionBase?: number;
  config?: Preset;
  setSessionBase: (sessionBase?: number) => void;
  setConfig: (config: Preset) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      mode: TrackerMode.Blind,
      setSessionBase: (sessionBase?: number) =>
        set((state) => ({ sessionBase })),
      setConfig: (config: Preset) => set({ config }),
    }),
    {
      name: "tracker-secure-storage",
      storage: secureStore,
      partialize: (state) => {},
    }
  )
);
