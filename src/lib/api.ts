import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: false,
});

export default api;

export const pinPost = async (postId: number, isPinned: boolean, token: string) => {
  const response = await api.patch(
    `/posts/${postId}/pin`,
    { is_pinned: isPinned },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};