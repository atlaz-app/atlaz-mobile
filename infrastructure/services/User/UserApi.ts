import { BackendPaths } from "@/enums/Paths";
import backendClient from "../../clients/backendClient";

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
  getAllUsers: () => backendClient.get(BackendPaths.UserAll),
};
