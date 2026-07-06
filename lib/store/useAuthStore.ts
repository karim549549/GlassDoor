import { create } from "zustand";

interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
}

interface AuthState {
  user: UserProfile | null;
  roles: string[];
  isLoading: boolean;
  setAuth: (user: UserProfile | null, roles: string[]) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  roles: ["GUEST"],
  isLoading: true,
  setAuth: (user, roles) => set({ user, roles: roles.length > 0 ? roles : ["USER"], isLoading: false }),
  clearAuth: () => set({ user: null, roles: ["GUEST"], isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
export default useAuthStore;
