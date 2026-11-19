import { create } from 'zustand';
import { User } from '../types/auth';
import { apiClient } from '../api/client';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialToken = localStorage.getItem('streamx_token');
  const initialUserStr = localStorage.getItem('streamx_user');
  let initialUser: User | null = null;
  if (initialUserStr) {
    try {
      initialUser = JSON.parse(initialUserStr);
    } catch {
      initialUser = null;
    }
  }

  return {
    token: initialToken,
    user: initialUser,
    isAuthenticated: !!initialToken,
    isLoading: false,

    setAuth: (user: User, token: string) => {
      localStorage.setItem('streamx_token', token);
      localStorage.setItem('streamx_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },

    logout: async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch {
        // Ignore logout errors
      } finally {
        localStorage.removeItem('streamx_token');
        localStorage.removeItem('streamx_user');
        set({ user: null, token: null, isAuthenticated: false });
      }
    },

    fetchProfile: async () => {
      set({ isLoading: true });
      try {
        const { data } = await apiClient.get<{ user: User }>('/auth/me');
        localStorage.setItem('streamx_user', JSON.stringify(data.user));
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    },
  };
});
