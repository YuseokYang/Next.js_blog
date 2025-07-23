'use client';

import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { useEffect, useState } from 'react';
import { isTokenExpired } from '@/utils/isTokenExpired';
import sanitizeHtml from 'sanitize-html';
import { AxiosError } from 'axios';

interface FormData {
  title: string;
  content: string;
}

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user, signOut } = useAuth();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const { register, handleSubmit, reset, setValue, getValues } = useForm<FormData>();

  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      signOut();
      router.push('/sign-in');
    } else {
      setIsAuthChecked(true);
    }
  }, [token, signOut, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await api.get(`/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: isAuthChecked,
  });

  useEffect(() => {
    if (data) {
      reset({ title: data.title, content: data.content });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.put(`/posts/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => router.push(`/posts/${id}`),
    onError: (err: unknown) => {
      const axiosError = err as AxiosError;
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        signOut();
        router.push('/sign-in');
      } else {
        alert('글 수정 중 오류가 발생했습니다.');
      }
    },
  });

  const onSubmit = (formData: FormData) => {
    mutation.mutate(formData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const imageUrl = await uploadImageToServer(file);
      if (!imageUrl.startsWith('http')) {
        alert('올바르지 않은 이미지 URL입니다.');
        return;
      }

      const imageTag = sanitizeHtml(`<img src="${imageUrl}" alt="image" />`, {
        allowedTags: ['img'],
        allowedAttributes: { img: ['src', 'alt'] },
        allowedSchemes: ['https'],
      });

      const currentContent = getValues('content') || '';
      setValue('content', `${currentContent}\n${imageTag}\n`);
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/posts/upload/image', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data.url;
  };

  if (!isAuthChecked) return null;
  if (isLoading) return <p className="p-4">로딩 중...</p>;
  if (!data || data.username !== user?.sub)
    return <p className="p-4 text-red-500">수정 권한이 없습니다.</p>;

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

        {/* 이미지 업로드 UI */}
        <div>
          <label className="block mb-1 font-medium">이미지 업로드</label>
          <div className="flex items-center space-x-4">
            <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
              이미지 선택
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            {selectedFileName && <span className="text-sm text-gray-700">{selectedFileName}</span>}
          </div>
          {previewUrl && (
            <div className="mt-3">
              <img
                src={previewUrl}
                alt="preview"
                className="max-w-xs rounded border"
              />
            </div>
          )}
          {isUploading && (
            <p className="text-sm text-gray-500 mt-2">이미지 업로드 중...</p>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? '수정 중...' : '수정하기'}
        </button>
      </form>
    </main>
  );
}
