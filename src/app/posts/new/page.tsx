'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { isTokenExpired } from '@/utils/isTokenExpired';
import sanitizeHtml from 'sanitize-html';

interface FormData {
  title: string;
  content: string;
}

export default function NewPostPage() {
  const router = useRouter();
  const { register, handleSubmit, setValue, getValues, reset } = useForm<FormData>();
  const { token, signOut } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // ✅ 이미지 업로드용 상태
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      signOut();
      router.push('/sign-in');
    } else {
      setIsAuthChecked(true);
    }
  }, [token, signOut, router]);

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: FormData) => {
      return await api.post('/posts', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      reset();
      setSelectedFileName('');
      setPreviewUrl('');
      router.push('/');
    },
  });

  const onSubmit = (data: FormData) => mutate(data);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const imageUrl = await uploadImageToServer(file);

      if (!isValidImageUrl(imageUrl)) {
        alert('올바르지 않은 이미지 URL입니다.');
        return;
      }

      insertImageToContent(imageUrl);
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

  const isValidImageUrl = (url: string): boolean => url.startsWith('http');

  const insertImageToContent = (url: string) => {
    const imageTag = sanitizeHtml(`<img src="${url}" alt="image" />`, {
      allowedTags: ['img'],
      allowedAttributes: { img: ['src', 'alt'] },
      allowedSchemes: ['https'],
    });

    const currentContent = getValues('content') || '';
    setValue('content', `${currentContent}\n${imageTag}\n`);
  };

  if (!isAuthChecked) return null;

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">새 글 작성</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">제목</label>
          <input
            type="text"
            {...register('title', { required: true })}
            className="w-full border p-2 rounded"
            placeholder="제목을 입력하세요"
          />
        </div>

        <div>
          <label className="block mb-1">내용</label>
          <textarea
            {...register('content', { required: true })}
            className="w-full border p-2 rounded h-40 whitespace-pre-wrap"
            placeholder="내용을 입력하세요"
          />
        </div>

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

            {selectedFileName && (
              <span className="text-sm text-gray-700">{selectedFileName}</span>
            )}
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

        {error && (
          <p className="text-red-500 text-sm">오류가 발생했습니다. 다시 시도해주세요.</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? '작성 중...' : '작성하기'}
        </button>
      </form>
    </main>
  );
}
