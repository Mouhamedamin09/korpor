// stores/authStore.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => Promise<void>;
  loadTokens: () => Promise<void>;
  clearTokens: () => Promise<void>;
}

export const authStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,

  setTokens: async (access, refresh) => {
    await SecureStore.setItemAsync("accessToken", access);
    await SecureStore.setItemAsync("refreshToken", refresh);
    set({ accessToken: access, refreshToken: refresh });
  },

  loadTokens: async () => {
    const access = await SecureStore.getItemAsync("accessToken");
    const refresh = await SecureStore.getItemAsync("refreshToken");
    set({ accessToken: access, refreshToken: refresh });
  },

  clearTokens: async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    set({ accessToken: null, refreshToken: null });
  },
}));
