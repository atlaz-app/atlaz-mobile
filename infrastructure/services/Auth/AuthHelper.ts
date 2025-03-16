import { AuthApi, LoginRequestBody } from './AuthApi';
import { useAuthStore } from '@/store';
import { RegisterForm } from '@/forms';

export const AuthHelper = {
  login: async (data: LoginRequestBody): Promise<boolean> => {
    try {
      const loginResponse = await AuthApi.login(data);

      const authStore = useAuthStore.getState();

      authStore.setAccessToken(loginResponse.data.accessToken);
      authStore.setRefreshToken(loginResponse.data.refreshToken);
      authStore.setAuthenticated(true);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  register: async (data: RegisterForm): Promise<string | undefined> => {
    try {
      const { age, experienceYears, ...rest } = data;

      const registerRequestBody = {
        ...rest,
        age: Number(age),
        experienceYears: Number(experienceYears),
      };

      const registrationResponse = await AuthApi.register(registerRequestBody);

      return registrationResponse.data.email;
    } catch (e) {
      console.error(e);
    }
  },

  verifyEmail: async (data: { email: string; code: string }): Promise<boolean> => {
    try {
      const verifyEmailResponse = await AuthApi.verifyEmail(data);

      const authStore = useAuthStore.getState();

      authStore.setAccessToken(verifyEmailResponse.data.accessToken);
      authStore.setRefreshToken(verifyEmailResponse.data.refreshToken);
      authStore.setAuthenticated(true);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
};
