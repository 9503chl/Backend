'use client'

import { signOut, useSession } from 'next-auth/react';

export default function LoginButtonContent() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const handleLogin = () => {
    try {
      window.location.href = '/login';
    } catch (error) {
      console.error('로그인 페이지 이동 중 오류 발생:', error);
      alert('로그인 페이지로 이동할 수 없습니다.');
    }
  };

  if (session) {
    return (
      <button 
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        로그아웃
      </button>
    );
  }

  return (
    <button 
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      로그인
    </button>
  );
}
