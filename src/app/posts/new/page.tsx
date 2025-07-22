'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { isTokenExpired } from '@/utils/isTokenExpired';
import sanitizeHtml from "sanitize-html"; // 꼭 상단에 추가


interface FormData {
  title: string;
  content: string;
}

export default function NewPostPage() {
  const router = useRouter();
  const { register, handleSubmit, setValue, getValues, reset } = useForm<FormData>();
  const { token, signOut } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false); // 🔒 진입 인증 완료 여부

  // 🔐 페이지 진입 시 토큰 만료 확인
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
      router.push('/');
    },
  });

  const onSubmit = (data: FormData) => mutate(data);

 

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    setIsUploading(true);

    const res = await api.post("/posts/upload/image", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const imageUrl: string = res.data.url;

    console.log("✅ imageUrl:", imageUrl);

    // Cloudinary URL이 절대경로로 올바르게 들어왔는지 확인
    if (!imageUrl.startsWith("http")) {
      alert("올바르지 않은 이미지 URL입니다.");
      return;
    }

    // sanitizeHtml 사용: src 앞에 / 없이 정확한 절대 URL만 허용
    const imageTag = sanitizeHtml(`<img src="${imageUrl}" alt="image" />`, {
      allowedTags: ["img"],
      allowedAttributes: { img: ["src", "alt"] },
      allowedSchemes: ["https"],
    });

    // 기존 본문에 이미지 삽입
    const currentContent = getValues("content") || "";
    setValue("content", `${currentContent}\n${imageTag}\n`);
  } catch (err) {
    alert("이미지 업로드에 실패했습니다.");
    console.error(err);
  } finally {
    setIsUploading(false);
  }
};



  // 🔐 인증 확인 전에는 아무것도 렌더링하지 않음
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
          <label className="block mb-1">이미지 업로드</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          {isUploading && <p className="text-sm text-gray-500 mt-1">이미지 업로드 중...</p>}
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
