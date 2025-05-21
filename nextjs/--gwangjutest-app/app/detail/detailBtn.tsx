'use client'

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DetailBtn() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleClick = () => {
    if (!session) {
      router.push('/login');
      return;
    }

    router.push(`/detail?email=${session.user?.email}`);
  };

  return (
    <button 
      onClick={handleClick}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      상세 정보 보기
    </button>
  );
}
