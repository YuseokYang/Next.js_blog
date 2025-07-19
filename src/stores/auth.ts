import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  sub: string;
  exp: number;
}

interface AuthState {
  token: string | null;
  user: DecodedToken | null;
  signIn: (token: string) => void;
  signOut: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  signIn: (token) =>
    set(() => ({
      token,
      user: jwtDecode<DecodedToken>(token),
    })),
  signOut: () => {
    localStorage.removeItem("access_token");
    set({ token: null, user: null });
  },
}));
