"use client";

import { useRouter } from "next/navigation";
import api from "@/lib/api";
import AuthForm from "@/components/AuthForm";
import { FormValues } from "@/components/AuthForm";
export default function SignUpPage() {
  const router = useRouter();

  



const handleSignUp = async (data: FormValues) => {
  // ❗ email이 빈 문자열("")이면 undefined로 바꿔서 제외
  const cleanData = {
    username: data.username,
    password: data.password,
    ...(data.email ? { email: data.email } : {}),
  };

  await api.post("/user/sign-up", cleanData);
  router.push("/sign-in");
};


  return (
    <>
      <h1 className="text-xl font-bold text-center my-6">회원가입</h1>
      <AuthForm onSubmit={handleSignUp} submitLabel="Sign Up" showEmail />
    </>
  );
}
