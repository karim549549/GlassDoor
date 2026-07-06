import { create } from "zustand";

interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
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

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    message: "Sherif replied to your Vodafone salary comment.",
    read: false,
    date: "2 hours ago",
  },
  {
    id: "2",
    message: "Your submission for PwC Egypt has been verified.",
    read: false,
    date: "1 day ago",
  },
  {
    id: "3",
    message: "Welcome to Devs Arena! Your profile sync is complete.",
    read: true,
    date: "3 days ago",
  },
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  roles: ["GUEST"],
  isLoading: true,
  notifications: MOCK_NOTIFICATIONS,
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
