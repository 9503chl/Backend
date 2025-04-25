'use client';

import { useState } from 'react';
import styles from '@/app/login/login.module.css';

export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // 로그인 성공 시 쿠키 설정을 기다린 후 리디렉션
        setTimeout(() => {
          // 강제로 페이지 새로고침하면서 홈으로 이동
          window.location.replace('/');
        }, 100);
      } else {
        setError(data.message || '로그인에 실패했습니다.');
        setLoading(false);
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('로그인 처리 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <h1 className={styles.formTitle}>웹 에디터 로그인</h1>
      
      <div className={styles.formGroup}>
        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          placeholder="비밀번호를 입력하세요"
          className={styles.passwordInput}
          autoFocus
        />
      </div>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <button 
        type="submit" 
        disabled={loading} 
        className={styles.loginButton}
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
} 