'use client'

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (session) {
    setTimeout(() => {
      router.push('/');
    }, 0);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await signIn('custom', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError('이메일 또는 비밀번호가 일치하지 않습니다.');
        return;
      }

    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  return (
    <div>
      <div>
        <h2>로그인</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
