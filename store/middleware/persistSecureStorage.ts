import * as SecureStore from 'expo-secure-store';

export const secureStore = {
  getItem: async (key: string) => {
    const value = await SecureStore.getItemAsync(key);
    return value !== null ? JSON.parse(value) : null;
  },
  setItem: async (key: string, value: any) => {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};
