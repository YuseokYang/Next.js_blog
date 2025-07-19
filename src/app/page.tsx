"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Post } from "@/types/post";
import Link from "next/link";
import { useAuth } from "@/stores/auth";

export default function HomePage() {
  const { data, isLoading, error } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => (await api.get("/posts")).data,
  });

  const user = useAuth((s) => s.user);

  if (isLoading) return <p className="p-4">로딩 중...</p>;
  if (error) return <p className="p-4 text-red-500">에러가 발생했습니다.</p>;

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
        <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">게시글 목록</h1>
        {user ? (
          <Link href="/posts/new" className="bg-blue-600 text-white px-4 py-2 rounded">
            새 글 작성
          </Link>
        ) : (
        <div className="space-x-2">
          <Link href="/sign-in" className="bg-gray-500 text-white px-4 py-2 rounded">
            로그인
          </Link>
          <Link href="/signup" className="bg-gray-400 text-white px-4 py-2 rounded">
            회원가입
          </Link>
          </div>
        )}
      </header>
      <ul className="space-y-3">
        {data?.map((post) => (
          <li key={post.id} className="border p-4 rounded shadow">
            <Link
              href={`/posts/${post.id}`}
              className="text-lg font-semibold hover:underline"
            >
              {post.title}
            </Link>
            <p className="text-sm text-gray-600">by {post.username}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
