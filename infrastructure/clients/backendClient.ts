import { BackendPaths } from "@/enums/Paths";
import { useAuthStore } from "@/store";
import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

declare module "axios" {
  export interface AxiosRequestConfig {
    withAuth: boolean;
  }
}

const BACKEND_API = process.env.EXPO_PUBLIC_BACKEND_API || "";

const backendClient = axios.create({
  baseURL: BACKEND_API,
  withAuth: true,
});

backendClient.interceptors.request.use(
  async (config) => {
    if (config.withAuth) {
      const authStore = useAuthStore.getState();
      const accessToken = authStore.accessToken;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

backendClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config: { _retry: boolean } }) => {
    const originalRequest = error.config;
    if (
      error?.response?.status === 401 &&
      !originalRequest?._retry &&
      error.config?.withAuth
    ) {
      originalRequest._retry = true;
      try {
        const authStore = useAuthStore.getState();
        const expiredAccessToken = authStore.accessToken;
        const refreshToken = authStore.accessToken;

        const decodedExpiredAccessToken = jwtDecode(expiredAccessToken || "");

        const response = await axios.post(
          BACKEND_API + BackendPaths.AuthRefresh,
          {
            userId: decodedExpiredAccessToken.sub,
            refreshToken,
          }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data;

        authStore.setAccessToken(newAccessToken);
        authStore.setRefreshToken(newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return backendClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        const authStore = useAuthStore.getState();
        authStore.setAccessToken("");
        authStore.setRefreshToken("");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default backendClient;
