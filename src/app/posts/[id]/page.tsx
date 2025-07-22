"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import api, { pinPost } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import CommentForm from "@/components/CommentForm";
import CommentItem from "@/components/CommentItem";
import sanitizeHtml from "sanitize-html";

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

  const { data, isLoading, refetch } = useQuery({
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

  const handlePinToggle = async () => {
    try {
      await pinPost(Number(id), !data.is_pinned, token!);
      alert("공지글 상태가 변경되었습니다.");
      refetch();
    } catch (err) {
      alert("공지글 상태 변경에 실패했습니다.");
      console.error(err);
    }
  };

  if (isLoading) return <p className="p-4">로딩 중...</p>;
  if (!data) return <p className="p-4 text-red-500">글을 불러올 수 없습니다.</p>;

  // ✅ sanitize: Cloudinary 이미지 포함한 본문 처리
  const sanitizedContent = sanitizeHtml(data.content, {
  allowedTags: ["b", "i", "em", "strong", "a", "p", "br", "img", "ul", "ol", "li"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["http", "https", "data"],
  allowedSchemesByTag: {
    img: ["https", "http", "data"],
  },
  });

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">{data.title}</h1>
        <div
          className="bg-gray-100 text-gray-800 rounded p-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ></div>
        <p className="text-sm text-gray-500">작성자: {data.username}</p>
        {data.is_pinned && (
          <p className="text-sm text-orange-500 font-semibold">📌 공지글</p>
        )}
      </section>

      {/* ✅ 관리자만 공지 버튼 표시 */}
      {user?.admin && (
        <div className="mt-2">
          <button
            onClick={handlePinToggle}
            className={`px-4 py-2 rounded ${
              data.is_pinned ? "bg-red-500" : "bg-blue-600"
            } text-white`}
          >
            {data.is_pinned ? "공지 해제" : "공지로 설정"}
          </button>
        </div>
      )}

      {/* ✅ 작성자만 수정/삭제 버튼 표시 */}
      {user?.sub === data.username && (
        <div className="flex space-x-2 mt-4">
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
              onChange={fetchComments}
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
