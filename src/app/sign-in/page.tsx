"use client";

import { useRouter } from "next/navigation";
import api from "@/lib/api";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/stores/auth";
import { FormValues } from "@/components/AuthForm";
export default function SignInPage() {
  const router = useRouter();
  const signInStore = useAuth((s) => s.signIn);

  

const handleSignIn = async (data: { username: string; password: string }) => {
  const res = await api.post("/user/sign-in", data);

  // ✅ "token" 키에서 꺼냅니다 (기존 "access_token"은 ❌)
  const token = res.data.token;

  if (!token || typeof token !== "string") {
    alert("로그인 실패: 유효하지 않은 토큰입니다.");
    return;
  }

  localStorage.setItem("access_token", token);
  signInStore(token);
  router.push("/");
};


  return (
    <>
      <h1 className="text-xl font-bold text-center my-6">로그인</h1>
      <AuthForm onSubmit={handleSignIn} submitLabel="Sign In" />
    </>
  );
}
