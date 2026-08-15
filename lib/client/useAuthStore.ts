import { create } from "zustand";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  companyMemberships?: Array<{
    companyId: string;
    role: string;
    company: {
      id: string;
      name: string;
      slug: string;
      logoUrl: string | null;
    };
  }>;
}

/**
 * Mirrors the `NotificationDto` returned by GET /api/notifications, which is
 * what populates this now — `message` is the notification's `body` and `date`
 * its ISO `createdAt`. Nothing in the app constructs these locally.
 */
export interface NotificationItem {
  id: string;
  kind: string;
  title: string;
  message: string;
  linkUrl: string | null;
  read: boolean;
  date: string;
}

interface AuthState {
  user: UserProfile | null;
  roles: string[];
  isLoading: boolean;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  setAuth: (user: UserProfile | null, roles: string[]) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setNotifications: (notifications: NotificationItem[], unreadCount: number) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  roles: ["GUEST"],
  // True until AuthProvider's /api/auth/me call resolves. Components that
  // branch on auth should render a neutral state while this is true rather
  // than assuming signed-out.
  isLoading: true,
  notifications: [],
  unreadNotificationCount: 0,
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
      unreadNotificationCount: 0,
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  setNotifications: (notifications, unreadCount) =>
    set({ notifications, unreadNotificationCount: unreadCount }),
  // Local echo of a server-side PATCH; the caller owns the request, this only
  // keeps the badge honest without a refetch.
  markNotificationAsRead: (id) =>
    set((state) => {
      const wasUnread = state.notifications.some((n) => n.id === id && !n.read);
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadNotificationCount: Math.max(
          0,
          state.unreadNotificationCount - (wasUnread ? 1 : 0)
        ),
      };
    }),
  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadNotificationCount: 0,
    })),
  clearNotifications: () =>
    set({
      notifications: [],
      unreadNotificationCount: 0,
    }),
}));
export default useAuthStore;
