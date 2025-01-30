import { create } from "zustand";
import { persist } from "zustand/middleware";
import { secureStore } from "./middleware";

interface AuthState {
  username?: string;
  accessToken?: string;
  refreshToken?: string;
  authenticated: boolean;
  setUsername: (username: string) => void;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authenticated: false,
      setUsername: (username: string) => set((state) => ({ username })),
      setAccessToken: (accessToken: string) =>
        set((state) => ({ accessToken })),
      setRefreshToken: (refreshToken: string) =>
        set((state) => ({ refreshToken })),
      setAuthenticated: (isAuthenticated: boolean) =>
        set((state) => ({ authenticated: isAuthenticated })),
    }),
    {
      name: "auth-secure-storage",
      storage: secureStore,
      partialize: (state) => {
        accessToken: state.accessToken;
        refreshToken: state.refreshToken;
      },
    }
  )
);
