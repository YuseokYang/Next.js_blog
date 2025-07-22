'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isTokenExpired } from '@/utils/isTokenExpired';

interface FormData {
  title: string;
  content: string;
}

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user, signOut } = useAuth();
  const [isAuthChecked, setIsAuthChecked] = useState(false); // ✅ 진입 토큰 검사용

  // ✅ 페이지 진입 시 토큰 유효성 검사
  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      signOut();
      router.push('/sign-in');
    } else {
      setIsAuthChecked(true);
    }
  }, [token]);

  const { data, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await api.get(`/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
    enabled: isAuthChecked, // ✅ 토큰 검사 후에만 실행
  });

  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    if (data) {
      reset({ title: data.title, content: data.content });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const res = await api.put(`/posts/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          signOut();
          router.push('/sign-in');
        }
        throw err;
      }
    },
    onSuccess: () => router.push(`/posts/${id}`),
  });

  const onSubmit = (formData: FormData) => mutation.mutate(formData);

  // ✅ 인증 검사 안 끝났으면 아무것도 안 보여줌
  if (!isAuthChecked) return null;
  if (isLoading) return <p className="p-4">로딩 중...</p>;
  if (!data || data.username !== user?.sub) return <p className="p-4 text-red-500">수정 권한이 없습니다.</p>;

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">글 수정</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="text"
          placeholder="제목"
          {...register('title', { required: true })}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="내용"
          {...register('content', { required: true })}
          className="w-full p-2 border rounded h-40"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          수정하기
        </button>
      </form>
    </main>
  );
}
