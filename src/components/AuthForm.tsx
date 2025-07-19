"use client";

import { useForm } from "react-hook-form";

export interface FormValues {
  username: string;
  password: string;
  email?: string;
}

interface Props {
  onSubmit: (data: FormValues) => Promise<void>;
  submitLabel: string;
  showEmail?: boolean;
}

export default function AuthForm({ onSubmit, submitLabel, showEmail = false }: Props) {
  const { register, handleSubmit } = useForm<FormValues>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-sm mx-auto">
      {/* ✅ 1. username */}
      <input
        {...register("username", { required: true })}
        placeholder="Username"
        className="border p-2 rounded"
      />

      {/* ✅ 2. password */}
      <input
        {...register("password", { required: true })}
        placeholder="Password"
        type="password"
        className="border p-2 rounded"
      />

      {/* ✅ 3. email (선택) */}
      {showEmail && (
        <input
          {...register("email")}
          placeholder="Email (선택)"
          type="email"
          className="border p-2 rounded"
        />
      )}

      <button type="submit" className="bg-blue-600 text-white py-2 rounded">
        {submitLabel}
      </button>
    </form>
  );
}
