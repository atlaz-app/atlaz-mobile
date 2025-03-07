import { create } from "zustand";
import { persist } from "zustand/middleware";
import { secureStore } from "./middleware";
import { TrackerMode } from "@/enums/Common";

interface TrackerState {
  sessionBase?: number;
  mode?: TrackerMode;
  setMode: (mode: TrackerMode) => void;
  setSessionBase: (sessionBase: number) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      mode: TrackerMode.Blind,
      setMode: (mode: TrackerMode) => set((state) => ({ mode })),
      setSessionBase: (sessionBase: number) =>
        set((state) => ({ sessionBase })),
    }),
    {
      name: "tracker-secure-storage",
      storage: secureStore,
      partialize: (state) => {
        mode: state.mode;
      },
    }
  )
);
