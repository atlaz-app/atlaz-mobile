import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CallibriSensor, SensorInfo } from 'react-native-neurosdk2';
import { secureStore } from './middleware';

export type SensorList = Record<
  string,
  {
    info?: SensorInfo;
    sensor?: CallibriSensor;
    connected: boolean;
  }
>;

interface GlobalState {
  sensorList: SensorList;
  setSensorList: (sensorList: SensorList) => void;
  activeSensor?: string;
  setActiveSensor: (sensor?: string) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      sensorList: {},
      setActiveSensor: (activeSensor?: string) => set({ activeSensor }),
      setSensorList: (sensorList: SensorList) => set({ sensorList }),
    }),
    {
      name: 'global-secure-storage',
      storage: secureStore,
      partialize: (state) => ({
        activeSensor: state.activeSensor,
        sensorList: state.sensorList,
      }),
    },
  ),
);
