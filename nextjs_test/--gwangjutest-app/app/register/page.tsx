'use client'

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { update } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error);
        return;
      }

      // 세션 업데이트
      await update({
        ...data.session,
        user: {
          email: email
        }
      });

      setSuccess('회원가입이 완료되었습니다.');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      setEmail('');
      setPassword('');
      
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>회원가입</h2>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}

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
          가입하기
        </button>
      </form>
    </div>
  );
}
