import { create } from 'zustand';

export interface AuthUser {
  id: string;
  displayName: string;
  emails?: { value: string }[];
  photos?: { value: string }[];
}

interface AuthState {
  user: AuthUser | null;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  async fetchUser() {
    try {
      const res = await fetch(`${API_BASE_URL}/user`, {
        credentials: "include",
      });
      const contentType = res.headers.get("content-type");
      const text = await res.text();
      if (res.ok && contentType && contentType.includes("application/json")) {
        try {
          const data = JSON.parse(text);
          if (data) {
            useAuthStore.setState({ user: data });
          }
        } catch (e) {
          useAuthStore.setState({ user: null });
        }
      } else {
        useAuthStore.setState({ user: null });
      }
    } catch (e) {
      useAuthStore.setState({ user: null });
    }
  },
  async logout() {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    useAuthStore.setState({ user: null });
  },
}));
