"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import CommentForm from "@/components/CommentForm";
import CommentItem from "@/components/CommentItem"; // 👈 추가된 컴포넌트

interface Comment {
  id: number;
  content: string;
  user_id: number;
  post_id: number;
  username: string;
}

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => (await api.get(`/posts/${id}`)).data,
  });

  const [comments, setComments] = useState<Comment[]>([]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comment/post/${id}`);
      setComments(res.data);
    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  const deleteMutation = useMutation({
    mutationFn: async () =>
      await api.delete(`/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    onSuccess: () => router.push("/"),
  });

  if (isLoading) return <p className="p-4">로딩 중...</p>;
  if (!data) return <p className="p-4 text-red-500">글을 불러올 수 없습니다.</p>;

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6">
      <section>
        <h1 className="text-2xl font-bold">{data.title}</h1>
        <p className="text-gray-700 whitespace-pre-wrap">{data.content}</p>
        <p className="text-sm text-gray-500">작성자: {data.username}</p>
      </section>

      {user?.sub === data.username && (
        <div className="flex space-x-2">
          <Link
            href={`/posts/${id}/edit`}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            수정
          </Link>
          <button
            onClick={() => {
              if (confirm("정말 삭제하시겠습니까?")) deleteMutation.mutate();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            삭제
          </button>
        </div>
      )}

      <section className="space-y-2">
        <h2 className="text-xl font-semibold mt-6">댓글</h2>
        {comments.length === 0 ? (
          <p className="text-gray-500">아직 댓글이 없습니다.</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUsername={user?.sub || ""}
              token={token!}
              onChange={fetchComments} // 댓글 수정/삭제 후 새로고침
            />
          ))
        )}

        {token && (
          <CommentForm
            postId={Number(id)}
            token={token}
            onSuccess={fetchComments}
          />
        )}
      </section>
    </main>
  );
}
