"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Post } from "@/types/post";
import Link from "next/link";
import { useAuth } from "@/stores/auth";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { user, token, initialize, signOut } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initialize();
    setReady(true);
  }, []);

  const { data, isLoading, error } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => (await api.get("/posts")).data,
    enabled: ready,
  });

  if (!ready || isLoading) return <p className="p-4">로딩 중...</p>;
  if (error) return <p className="p-4 text-red-500">에러가 발생했습니다.</p>;

  // 👇 공지글과 일반글로 분리
  const pinnedPosts = data?.filter((post) => post.is_pinned);
  const normalPosts = data?.filter((post) => !post.is_pinned);

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      {/* 상단 헤더 */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">게시글 목록</h1>

        {!user ? (
          <div className="space-x-2">
            <Link
              href="/sign-in"
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              회원가입
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{user.sub}님</span>
            <button
              onClick={() => {
                signOut();
                location.reload();
              }}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              로그아웃
            </button>
          </div>
        )}
      </header>

      {/* 새 글 작성 버튼 (로그인한 경우만) */}
      {user && (
        <div className="mb-4">
          <Link
            href="/posts/new"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            새 글 작성
          </Link>
        </div>
      )}

      {/* 📌 공지글 */}
      {pinnedPosts && pinnedPosts.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2 text-orange-600">📌 공지글</h2>
          <ul className="space-y-3">
            {pinnedPosts.map((post) => (
              <li key={post.id} className="border p-4 rounded shadow bg-orange-50">
                <Link
                  href={`/posts/${post.id}`}
                  className="text-lg font-semibold hover:underline text-orange-800"
                >
                  📌 {post.title}
                </Link>
                <p className="text-sm text-gray-600">by {post.username}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 📝 일반 게시글 */}
      <section>
        <h2 className="text-lg font-semibold mt-6 mb-2">게시글</h2>
        <ul className="space-y-3">
          {normalPosts?.map((post) => (
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
      </section>
    </main>
  );
}
