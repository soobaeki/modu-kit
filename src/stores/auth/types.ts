export interface AuthUser {
  id: string;
  name?: string;
  role?: string;
}

export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setAuth: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

export type AuthStore = AuthState & AuthActions;
