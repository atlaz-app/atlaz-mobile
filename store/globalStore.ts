import { create } from "zustand";
import { persist } from "zustand/middleware";
import { secureStore } from "./middleware";
import { CallibriSensor, SensorInfo } from "react-native-neurosdk2";

export type SensorList = Record<
  string,
  {
    info?: SensorInfo;
    sensor?: CallibriSensor;
    connected: boolean;
  }
>;

interface GlobalState {
  sensorList?: SensorList;
  setSensorList: (sensorList: SensorList) => void;
  activeSensor?: string;
  setActiveSensor: (sensor?: string) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      setActiveSensor: (activeSensor?: string) =>
        set((state) => ({ activeSensor })),
      setSensorList: (sensorList: SensorList) =>
        set((state) => ({ sensorList })),
    }),
    {
      name: "global-secure-storage",
      storage: secureStore,
      partialize: (state) => {
        sensor: state.activeSensor;
        sensorList: state.sensorList;
      },
    }
  )
);
