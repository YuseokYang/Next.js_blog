'use client';

import { useState } from 'react';
import { pinPost } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface PinToggleButtonProps {
  postId: number;
  initialPinned: boolean;
  token: string;
}

export default function PinToggleButton({ postId, initialPinned, token }: PinToggleButtonProps) {
  const [isPinned, setIsPinned] = useState(initialPinned);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    try {
      setLoading(true);
      await pinPost(postId, !isPinned, token);
      setIsPinned(!isPinned);
      router.refresh(); // 페이지 새로고침
    } catch (error) {
      alert("공지글 상태 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded ${
        isPinned ? "bg-red-500 text-white" : "bg-gray-300 text-black"
      }`}
    >
      {isPinned ? "공지 해제" : "공지로 설정"}
    </button>
  );
}
