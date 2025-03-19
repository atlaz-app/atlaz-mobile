import { BackendPaths } from '@/enums/Paths';
import { backendClient } from '@/infrastructure/clients';
import { UserInfo } from '@/types';

export type RegisterRequestBody = {
  username: string;
  email: string;
  age: number | string;
  experienceYears: number | string;
  password: string;
};

export const UserApi = {
  getUserInfo: async () => backendClient.get<UserInfo>(BackendPaths.UserInfo),
};
