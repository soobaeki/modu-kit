import { create } from "zustand";
import { AuthStore } from "./types";

const initialState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
};

export const useAuth = create<AuthStore>((set) => ({
  ...initialState,

  setAuth: (accessToken, user) =>
    set({
      accessToken,
      user,
      isAuthenticated: true,
    }),

  setAccessToken: (accessToken) =>
    set({
      accessToken,
      isAuthenticated: true,
    }),

  clearAuth: () => set(initialState),
}));
