import { create } from "zustand";

interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
}

export interface NotificationItem {
  id: string;
  message: string;
  read: boolean;
  date: string;
}

interface AuthState {
  user: UserProfile | null;
  roles: string[];
  isLoading: boolean;
  notifications: NotificationItem[];
  setAuth: (user: UserProfile | null, roles: string[]) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  roles: ["GUEST"],
  isLoading: true,
  notifications: [],
  setAuth: (user, roles) =>
    set({
      user,
      roles: roles.length > 0 ? roles : ["USER"],
      isLoading: false,
    }),
  clearAuth: () =>
    set({
      user: null,
      roles: ["GUEST"],
      isLoading: false,
      notifications: [],
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  clearNotifications: () =>
    set({
      notifications: [],
    }),
}));
export default useAuthStore;
