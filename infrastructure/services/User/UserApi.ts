import { BackendPaths } from "@/enums/Paths";
import backendClient from "../../clients/backendClient";
import { Preset, UserInfo } from "@/types";
import { AxiosResponse } from "axios";

type LoginRequestBody = {
  email: string;
  password: string;
};

export type RegisterRequestBody = {
  username: string;
  email: string;
  age: number | string;
  experienceYears: number | string;
  password: string;
};

export const UserApi = {
  session: {
    getUserInfo: async () => backendClient.get<UserInfo>(BackendPaths.UserInfo),
  },
  presets: {
    createPreset: async (preset: Preset) =>
      backendClient.post<Preset[]>(BackendPaths.UserPresets, preset),
    getPresetList: async () =>
      backendClient.get<Preset[]>(BackendPaths.UserPresets),
    deletePreset: async (presetId: number) =>
      backendClient.delete<Preset[]>(BackendPaths.UserPresetById(presetId)),
  },
};
