"use client";

import { useState } from "react";
import api from "@/lib/api";

interface CommentFormProps {
  postId: number;
  token: string;
  onSuccess: () => void;
}

export default function CommentForm({ postId, token, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await api.post(
        `/comment/${postId}`, // ✅ 여기 수정
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setContent("");
      onSuccess();
    } catch (err) {
      setError("댓글 작성에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="댓글을 입력하세요..."
        className="w-full border border-gray-300 rounded p-2 text-sm"
        rows={3}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 text-sm"
      >
        댓글 작성
      </button>
    </form>
  );
}
