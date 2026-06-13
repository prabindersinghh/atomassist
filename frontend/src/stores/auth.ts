import { create } from 'zustand';
import { AuthState, User, UserRole } from '../types/index.js';

interface AuthStore extends AuthState {
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  restore: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,

  login: (user, token, refreshToken) => {
    set({
      user,
      token,
      refreshToken,
      isAuthenticated: true,
    });
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_refresh', refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  logout: () => {
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh');
    localStorage.removeItem('auth_user');
  },

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  restore: () => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    const refreshToken = localStorage.getItem('auth_refresh');

    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
        refreshToken,
        isAuthenticated: true,
      });
    }
  },
}));
