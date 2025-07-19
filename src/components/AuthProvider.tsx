"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/stores/auth";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const signIn = useAuth((s) => s.signIn);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) signIn(token);
  }, [signIn]);

  return <>{children}</>;
}
