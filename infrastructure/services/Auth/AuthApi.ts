import { BackendPaths } from "@/enums/Paths";
import backendClient from "../../clients/backendClient";
import { AxiosResponse } from "axios";

export type LoginRequestBody = {
  email: string;
  password: string;
};

export type RegisterRequestBody = {
  username: string;
  email: string;
  age: number;
  experienceYears: number;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterResponse = {
  accessToken: string;
  refreshToken: string;
};

export const AuthApi = {
  login: (data: LoginRequestBody) =>
    backendClient.post<LoginResponse>(BackendPaths.AuthLogin, data, {
      withAuth: false,
    }),

  register: (data: RegisterRequestBody) =>
    backendClient.post<RegisterResponse>(BackendPaths.AuthRegister, data, {
      withAuth: false,
    }),
};
