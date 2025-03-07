import { create } from "zustand";
import { persist } from "zustand/middleware";
import { secureStore } from "./middleware";
import { CallibriSensor } from "react-native-neurosdk2";

interface GlobalState {
  sensor?: CallibriSensor;
  setSensor: (sensor: CallibriSensor) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      setSensor: (sensor: CallibriSensor) => set((state) => ({ sensor })),
    }),
    {
      name: "global-secure-storage",
      storage: secureStore,
      partialize: (state) => {
        sensor: state.sensor;
      },
    }
  )
);
