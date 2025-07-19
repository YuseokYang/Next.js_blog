// lib/comment.ts
import api from "./api";

export async function createComment(postId: number, content: string, token: string) {
  return (
    await api.post(`/comment/${postId}`, { content }, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data;
}

export async function updateComment(commentId: number, content: string, token: string) {
  return (
    await api.put(`/comment/${commentId}`, { content }, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data;
}

export async function deleteComment(commentId: number, token: string) {
  return (
    await api.delete(`/comment/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data;
}
