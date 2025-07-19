// src/app/posts/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/stores/auth";

interface FormData {
  title: string;
  content: string;
}

export default function NewPostPage() {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormData>();
  const token = useAuth((s) => s.token);

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: FormData) => {
      return await api.post("/posts", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      reset();
      router.push("/");
    },
  });

  const onSubmit = (data: FormData) => mutate(data);

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">새 글 작성</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">제목</label>
          <input
            type="text"
            {...register("title", { required: true })}
            className="w-full border p-2 rounded"
            placeholder="제목을 입력하세요"
          />
        </div>
        <div>
          <label className="block mb-1">내용</label>
          <textarea
            {...register("content", { required: true })}
            className="w-full border p-2 rounded h-40"
            placeholder="내용을 입력하세요"
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm">오류가 발생했습니다. 다시 시도해주세요.</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "작성 중..." : "작성하기"}
        </button>
      </form>
    </main>
  );
}
