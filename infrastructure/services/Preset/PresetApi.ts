import { BackendPaths } from '@/enums/Paths';
import { backendClient } from '@/infrastructure/clients';
import { Preset } from '@/types';

export const PresetApi = {
  createPreset: async (preset: Preset) => backendClient.post<Preset[]>(BackendPaths.PresetsCreate, preset),
  getPresetList: async () => backendClient.get<Preset[]>(BackendPaths.Presets),
  deletePreset: async (presetId: number) => backendClient.delete<Preset[]>(BackendPaths.PresetById(presetId)),
};
