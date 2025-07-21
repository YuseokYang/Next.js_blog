import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  sub: string;
  exp: number;
  iat: number;
  admin?: boolean;
}

interface AuthState {
  token: string | null;
  user: DecodedToken | null;
  signIn: (token: string) => void;
  signOut: () => void;
  initialize: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  signIn: (token) => {
    localStorage.setItem("access_token", token);
    set({
      token,
      user: jwtDecode<DecodedToken>(token),
    });
  },
  signOut: () => {
    localStorage.removeItem("access_token");
    set({ token: null, user: null });
  },
  initialize: () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        set({
          token,
          user: jwtDecode<DecodedToken>(token),
        });
      } catch {
        localStorage.removeItem("access_token");
        set({ token: null, user: null });
      }
    }
  },
}));
