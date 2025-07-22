"use client";

import { useState, useEffect } from "react";
import { updateComment, deleteComment } from "@/lib/comment";
import { useAuth } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { isTokenExpired } from "@/utils/isTokenExpired";

interface CommentItemProps {
  comment: {
    id: number;
    content: string;
    username: string;
    user_id: number;
  };
  currentUsername: string;
  token: string;
  onChange: () => void;
}

export default function CommentItem({ comment, currentUsername, token, onChange }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [error, setError] = useState("");
  const { signOut } = useAuth();
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      signOut();
      router.push("/sign-in");
    } else {
      setIsAuthChecked(true);
    }
  }, [token]);

  const handleUpdate = async () => {
    try {
      await updateComment(comment.id, content, token);
      setEditing(false);
      onChange();
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        signOut();
        router.push("/sign-in");
        return;
      }
      setError("댓글 수정 실패");
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteComment(comment.id, token);
      onChange();
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        signOut();
        router.push("/sign-in");
        return;
      }
      setError("댓글 삭제 실패");
    }
  };

  if (!isAuthChecked) return null;

  const isOwner = currentUsername === comment.username;

  return (
    <div className="border p-3 rounded space-y-1">
      {editing ? (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded p-2 text-sm"
          />
          <div className="space-x-2">
            <button
              onClick={handleUpdate}
              className="text-sm bg-blue-500 text-white px-2 py-1 rounded"
            >
              저장
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-sm bg-gray-300 px-2 py-1 rounded"
            >
              취소
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="whitespace-pre-wrap">{comment.content}</p>
          <p className="text-sm text-gray-500">작성자: {comment.username}</p>
          {isOwner && (
            <div className="space-x-2">
              <button onClick={() => setEditing(true)} className="text-sm text-blue-500">
                수정
              </button>
              <button onClick={handleDelete} className="text-sm text-red-500">
                삭제
              </button>
            </div>
          )}
        </>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
